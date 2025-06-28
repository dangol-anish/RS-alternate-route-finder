"""
Test suite for Obstacle Cache Optimization

This module tests the in-memory obstacle caching system implemented to optimize
database query performance in the route finding application.
"""

import unittest
import time
import threading
import sys
import os
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

# Add the parent directory to the path to import routes
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the cache functions from routes
from routes import (
    obstacle_cache, 
    obstacle_cache_last_updated, 
    obstacle_cache_lock,
    OBSTACLE_CACHE_TTL,
    refresh_obstacle_cache, 
    get_obstacles_from_cache
)


class TestObstacleCache(unittest.TestCase):
    """Test cases for obstacle cache functionality."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        # Reset cache state before each test
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.clear()
            obstacle_cache_last_updated = None
    
    def tearDown(self):
        """Clean up after each test method."""
        # Reset cache state after each test
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.clear()
            obstacle_cache_last_updated = None
    
    @patch('routes.supabase')
    def test_refresh_obstacle_cache_success(self, mock_supabase):
        """Test successful cache refresh from database."""
        # Mock database response
        mock_response = Mock()
        mock_response.data = [
            {'node_id': 123},
            {'node_id': 456},
            {'node_id': 789}
        ]
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        # Call the function
        refresh_obstacle_cache()
        
        # Verify cache was updated
        self.assertEqual(obstacle_cache, {123, 456, 789})
        self.assertIsNotNone(obstacle_cache_last_updated)
        
        # Verify database was called
        mock_supabase.table.assert_called_once_with('obstacles')
        mock_supabase.table.return_value.select.assert_called_once_with('node_id')
    
    @patch('routes.supabase')
    def test_refresh_obstacle_cache_database_error(self, mock_supabase):
        """Test cache refresh handles database errors gracefully."""
        # Mock database error
        mock_supabase.table.return_value.select.return_value.execute.side_effect = Exception("Database error")
        
        # Call the function - should not raise exception
        refresh_obstacle_cache()
        
        # Verify cache remains unchanged
        self.assertEqual(len(obstacle_cache), 0)
    
    @patch('routes.refresh_obstacle_cache')
    def test_get_obstacles_from_cache_empty_cache(self, mock_refresh):
        """Test cache retrieval when cache is empty."""
        # Cache should be empty after setUp
        result = get_obstacles_from_cache()
        
        # Should call refresh and return empty set
        mock_refresh.assert_called_once()
        self.assertEqual(result, set())
    
    @patch('routes.refresh_obstacle_cache')
    def test_get_obstacles_from_cache_stale_data(self, mock_refresh):
        """Test cache retrieval triggers refresh for stale data."""
        # Set up stale cache
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.update([123, 456])
            obstacle_cache_last_updated = time.time() - OBSTACLE_CACHE_TTL - 10  # 10 seconds past TTL
        
        # Call the function
        result = get_obstacles_from_cache()
        
        # Verify refresh was called
        mock_refresh.assert_called_once()
    
    @patch('routes.refresh_obstacle_cache')
    def test_get_obstacles_from_cache_fresh_data(self, mock_refresh):
        """Test cache retrieval returns cached data when fresh."""
        # Set up fresh cache
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.update([123, 456, 789])
            obstacle_cache_last_updated = time.time() - 60  # 1 minute ago (within TTL)
        
        # Call the function
        result = get_obstacles_from_cache()
        
        # Should return cached data without calling refresh
        mock_refresh.assert_not_called()
        self.assertEqual(result, {123, 456, 789})
    
    @patch('routes.refresh_obstacle_cache')
    def test_get_obstacles_from_cache_returns_copy(self, mock_refresh):
        """Test that cache retrieval returns a copy, not the original."""
        # Set up cache
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.update([123, 456])
            obstacle_cache_last_updated = time.time() - 60
        
        # Get cached data
        result = get_obstacles_from_cache()
        
        # Modify the result
        result.add(999)
        
        # Original cache should be unchanged
        self.assertEqual(obstacle_cache, {123, 456})
        self.assertEqual(result, {123, 456, 999})
    
    def test_cache_thread_safety(self):
        """Test that cache operations are thread-safe."""
        results = []
        errors = []
        
        def worker(worker_id):
            """Worker function for concurrent cache access."""
            try:
                # Simulate multiple threads accessing cache simultaneously
                for i in range(10):
                    result = get_obstacles_from_cache()
                    results.append((worker_id, i, result))
                    time.sleep(0.01)  # Small delay to increase concurrency
            except Exception as e:
                errors.append((worker_id, str(e)))
        
        # Create multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=worker, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify no errors occurred
        self.assertEqual(len(errors), 0, f"Thread safety errors: {errors}")
        
        # Verify all operations completed
        self.assertEqual(len(results), 50)  # 5 threads * 10 operations each
    
    @patch('routes.refresh_obstacle_cache')
    def test_cache_ttl_expiration(self, mock_refresh):
        """Test that cache respects TTL expiration."""
        # Set up cache just at TTL boundary
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.update([123, 456])
            obstacle_cache_last_updated = time.time() - OBSTACLE_CACHE_TTL
        
        # Call the function
        get_obstacles_from_cache()
        
        # Should trigger refresh
        mock_refresh.assert_called_once()
    
    @patch('routes.refresh_obstacle_cache')
    def test_cache_ttl_within_bounds(self, mock_refresh):
        """Test that cache doesn't refresh when within TTL."""
        # Set up cache within TTL
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.update([123, 456])
            obstacle_cache_last_updated = time.time() - (OBSTACLE_CACHE_TTL - 60)  # 1 minute before expiration
        
        # Call the function
        result = get_obstacles_from_cache()
        
        # Should return cached data without refresh
        mock_refresh.assert_not_called()
        self.assertEqual(result, {123, 456})


class TestObstacleCachePerformance(unittest.TestCase):
    """Performance tests for obstacle cache."""
    
    def setUp(self):
        """Set up test fixtures."""
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.clear()
            obstacle_cache_last_updated = None
    
    @patch('routes.supabase')
    def test_cache_performance_vs_database(self, mock_supabase):
        """Test that cache is significantly faster than database queries."""
        # Mock database response
        mock_response = Mock()
        mock_response.data = [{'node_id': i} for i in range(100)]
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        # First call - should hit database
        start_time = time.time()
        refresh_obstacle_cache()
        db_time = time.time() - start_time
        
        # Subsequent calls - should hit cache
        cache_times = []
        for _ in range(10):
            start_time = time.time()
            get_obstacles_from_cache()
            cache_times.append(time.time() - start_time)
        
        avg_cache_time = sum(cache_times) / len(cache_times)
        
        # Cache should be at least 10x faster than database
        self.assertLess(avg_cache_time, db_time / 10, 
                       f"Cache time ({avg_cache_time:.6f}s) should be much faster than DB time ({db_time:.6f}s)")
    
    def test_cache_memory_usage(self):
        """Test that cache memory usage is reasonable."""
        # Populate cache with realistic data
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.update(range(1000))  # 1000 obstacles
            obstacle_cache_last_updated = time.time()
        
        # Get memory usage
        import sys
        cache_size = sys.getsizeof(obstacle_cache)
        
        # Cache should use less than 1MB for 1000 obstacles
        self.assertLess(cache_size, 1024 * 1024, 
                       f"Cache memory usage ({cache_size} bytes) should be reasonable")


class TestObstacleCacheIntegration(unittest.TestCase):
    """Integration tests for obstacle cache with actual route finding."""
    
    def setUp(self):
        """Set up test fixtures."""
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.clear()
            obstacle_cache_last_updated = None
    
    @patch('routes.supabase')
    @patch('routes.graph')
    @patch('routes.bidirectional_astar')
    def test_shortest_path_with_cache(self, mock_astar, mock_graph, mock_supabase):
        """Test that shortest_path endpoint uses cache correctly."""
        # Mock database response for obstacles
        mock_response = Mock()
        mock_response.data = [{'node_id': 123}, {'node_id': 456}]
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        # Mock graph structure
        mock_graph.nodes = {
            1: {'y': 27.7172, 'x': 85.3240},  # lat, lon
            2: {'y': 27.7173, 'x': 85.3241}
        }
        
        # Mock pathfinding result
        mock_astar.return_value = ([1, 2], [])
        
        # Import the route function
        from routes import shortest_path
        from flask import Flask
        import json
        
        # Create test app
        app = Flask(__name__)
        app.config['TESTING'] = True
        
        with app.test_request_context('/shortest_path', 
                                    method='POST',
                                    data=json.dumps({'source': 1, 'destination': 2}),
                                    content_type='application/json'):
            
            # Call the endpoint
            response = shortest_path()
            
            # Verify response
            self.assertEqual(response.status_code, 200)
            
            # Verify cache was used (database should be called once for initial cache)
            mock_supabase.table.assert_called_once()


class TestObstacleCacheEdgeCases(unittest.TestCase):
    """Test edge cases and error conditions."""
    
    def setUp(self):
        """Set up test fixtures."""
        global obstacle_cache, obstacle_cache_last_updated
        with obstacle_cache_lock:
            obstacle_cache.clear()
            obstacle_cache_last_updated = None
    
    @patch('routes.supabase')
    def test_cache_with_empty_database(self, mock_supabase):
        """Test cache behavior when database returns empty results."""
        # Mock empty database response
        mock_response = Mock()
        mock_response.data = []
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        # Refresh cache
        refresh_obstacle_cache()
        
        # Cache should be empty
        self.assertEqual(obstacle_cache, set())
    
    @patch('routes.supabase')
    def test_cache_with_invalid_node_ids(self, mock_supabase):
        """Test cache handles invalid node IDs gracefully."""
        # Mock response with invalid data
        mock_response = Mock()
        mock_response.data = [
            {'node_id': 'invalid_string'},
            {'node_id': 123},
            {'node_id': None}
        ]
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        # Should handle gracefully (only valid integers are added)
        refresh_obstacle_cache()
        
        # Only valid integer should be in cache
        self.assertEqual(obstacle_cache, {123})
    
    def test_cache_concurrent_modification(self):
        """Test cache behavior under concurrent modification."""
        results = []
        
        def modifier():
            """Function that modifies cache directly."""
            global obstacle_cache
            for i in range(100):
                with obstacle_cache_lock:
                    obstacle_cache.add(i)
                time.sleep(0.001)
        
        def reader():
            """Function that reads from cache."""
            for i in range(100):
                result = get_obstacles_from_cache()
                results.append(len(result))
                time.sleep(0.001)
        
        # Start modifier and reader threads
        modifier_thread = threading.Thread(target=modifier)
        reader_thread = threading.Thread(target=reader)
        
        modifier_thread.start()
        reader_thread.start()
        
        modifier_thread.join()
        reader_thread.join()
        
        # Should complete without errors
        self.assertEqual(len(results), 100)


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2) 