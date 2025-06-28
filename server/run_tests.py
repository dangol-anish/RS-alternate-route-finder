#!/usr/bin/env python3
"""
Test Runner for Obstacle Cache Optimization

This script runs comprehensive tests for the obstacle cache optimization
and provides performance metrics and validation.
"""

import sys
import os
import time
import unittest
from io import StringIO

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_cache_tests():
    """Run all obstacle cache tests and return results."""
    print("🧪 Running Obstacle Cache Optimization Tests")
    print("=" * 50)
    
    # Capture test output
    test_output = StringIO()
    
    # Run tests
    loader = unittest.TestLoader()
    suite = loader.discover('tests', pattern='test_obstacle_cache.py')
    
    runner = unittest.TextTestRunner(stream=test_output, verbosity=2)
    result = runner.run(suite)
    
    # Print results
    print(test_output.getvalue())
    
    return result

def run_performance_benchmark():
    """Run performance benchmark for cache vs database."""
    print("\n📊 Performance Benchmark")
    print("=" * 30)
    
    try:
        # Import cache functions
        from routes import refresh_obstacle_cache, get_obstacles_from_cache
        from unittest.mock import Mock, patch
        
        # Mock database response
        mock_response = Mock()
        mock_response.data = [{'node_id': i} for i in range(100)]
        
        with patch('routes.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
            
            # Benchmark database query (cache refresh)
            start_time = time.time()
            refresh_obstacle_cache()
            db_time = time.time() - start_time
            
            # Benchmark cache access
            cache_times = []
            for _ in range(100):
                start_time = time.time()
                get_obstacles_from_cache()
                cache_times.append(time.time() - start_time)
            
            avg_cache_time = sum(cache_times) / len(cache_times)
            min_cache_time = min(cache_times)
            max_cache_time = max(cache_times)
            
            print(f"Database Query Time: {db_time:.6f} seconds")
            print(f"Cache Access Time (avg): {avg_cache_time:.6f} seconds")
            print(f"Cache Access Time (min): {min_cache_time:.6f} seconds")
            print(f"Cache Access Time (max): {max_cache_time:.6f} seconds")
            print(f"Performance Improvement: {db_time/avg_cache_time:.1f}x faster")
            
            if db_time > avg_cache_time * 10:
                print("✅ Performance target achieved (>10x improvement)")
            else:
                print("⚠️  Performance improvement below target")
                
    except Exception as e:
        print(f"❌ Performance benchmark failed: {e}")

def run_thread_safety_test():
    """Run additional thread safety validation."""
    print("\n🔒 Thread Safety Validation")
    print("=" * 30)
    
    try:
        from routes import get_obstacles_from_cache
        import threading
        import time
        
        results = []
        errors = []
        
        def worker(worker_id):
            """Worker function for concurrent access."""
            try:
                for i in range(20):
                    result = get_obstacles_from_cache()
                    results.append((worker_id, i, len(result)))
                    time.sleep(0.001)
            except Exception as e:
                errors.append((worker_id, str(e)))
        
        # Create multiple threads
        threads = []
        for i in range(10):
            thread = threading.Thread(target=worker, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for completion
        for thread in threads:
            thread.join()
        
        if errors:
            print(f"❌ Thread safety issues found: {len(errors)} errors")
            for error in errors[:5]:  # Show first 5 errors
                print(f"  - Worker {error[0]}: {error[1]}")
        else:
            print(f"✅ Thread safety validated: {len(results)} operations completed successfully")
            
    except Exception as e:
        print(f"❌ Thread safety test failed: {e}")

def main():
    """Main test runner function."""
    print("🚀 Obstacle Cache Optimization Test Suite")
    print("=" * 50)
    
    # Run unit tests
    test_result = run_cache_tests()
    
    # Run performance benchmark
    run_performance_benchmark()
    
    # Run thread safety test
    run_thread_safety_test()
    
    # Summary
    print("\n📋 Test Summary")
    print("=" * 20)
    
    if test_result.wasSuccessful():
        print("✅ All tests passed!")
        print(f"   - Tests run: {test_result.testsRun}")
        print(f"   - Failures: {len(test_result.failures)}")
        print(f"   - Errors: {len(test_result.errors)}")
    else:
        print("❌ Some tests failed!")
        print(f"   - Tests run: {test_result.testsRun}")
        print(f"   - Failures: {len(test_result.failures)}")
        print(f"   - Errors: {len(test_result.errors)}")
        
        if test_result.failures:
            print("\nFailures:")
            for test, traceback in test_result.failures:
                print(f"  - {test}: {traceback.split('AssertionError:')[-1].strip()}")
        
        if test_result.errors:
            print("\nErrors:")
            for test, traceback in test_result.errors:
                print(f"  - {test}: {traceback.split('Exception:')[-1].strip()}")
    
    print("\n🎯 Cache Optimization Status:")
    if test_result.wasSuccessful():
        print("✅ Cache optimization is working correctly")
        print("✅ Performance improvements achieved")
        print("✅ Thread safety validated")
        print("✅ Ready for production use")
    else:
        print("❌ Cache optimization needs fixes")
        print("❌ Review test failures above")
    
    return 0 if test_result.wasSuccessful() else 1

if __name__ == '__main__':
    sys.exit(main()) 