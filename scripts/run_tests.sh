#!/bin/bash

# Script to install test dependencies and run tests with coverage
# Created for Placement-Navigator project

echo "===== Installing test dependencies ====="
pip install pytest pytest-asyncio pytest-cov

echo "===== Running unit tests ====="
python tests/test_matching.py

echo "===== Running integration tests ====="
python tests/test_integration.py

echo "===== Running all tests with coverage ====="
pytest tests/ -v --cov=backend --cov-report=html

echo "===== Testing completed ====="
echo "Coverage report is available in the htmlcov directory"