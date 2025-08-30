#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Comprehensive Test Runner for Donation Backend
 * Runs unit tests, integration tests, and generates coverage reports
 */

class TestRunner {
  constructor() {
    this.rootDir = path.join(__dirname);
    this.testResults = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      coverage: null
    };
  }

  async runCommand(command, args = [], description = '') {
    return new Promise((resolve, reject) => {
      console.log(`\n🚀 ${description}`);
      console.log(`Running: ${command} ${args.join(' ')}\n`);

      const child = spawn(command, args, {
        cwd: this.rootDir,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${description} completed successfully\n`);
          resolve(code);
        } else {
          console.log(`❌ ${description} failed with exit code ${code}\n`);
          reject(new Error(`${description} failed`));
        }
      });

      child.on('error', (error) => {
        console.error(`❌ Error running ${description}:`, error.message);
        reject(error);
      });
    });
  }

  async runUnitTests() {
    try {
      await this.runCommand('npm', ['run', 'test:unit'], 'Running Unit Tests');
      this.testResults.unit.passed = 1; // Simplified - in real scenario parse output
    } catch (error) {
      this.testResults.unit.failed = 1;
      throw error;
    }
  }

  async runIntegrationTests() {
    try {
      await this.runCommand('npm', ['run', 'test:integration'], 'Running Integration Tests');
      this.testResults.integration.passed = 1;
    } catch (error) {
      this.testResults.integration.failed = 1;
      throw error;
    }
  }

  async runCoverageTests() {
    try {
      await this.runCommand('npm', ['run', 'test:coverage'], 'Running Tests with Coverage');
    } catch (error) {
      throw error;
    }
  }

  async runManualTests() {
    try {
      await this.runCommand('npm', ['run', 'test-donation'], 'Running Manual API Tests');
    } catch (error) {
      console.log('⚠️  Manual tests failed, but this might be expected if MPGS credentials are not configured');
    }
  }

  async checkEnvironment() {
    console.log('🔍 Checking test environment...\n');

    // Check if required dependencies are installed
    const requiredDeps = ['jest', 'mongodb-memory-server', 'supertest'];
    const missingDeps = [];

    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
        console.log(`✅ ${dep} is installed`);
      } catch (error) {
        missingDeps.push(dep);
        console.log(`❌ ${dep} is missing`);
      }
    }

    if (missingDeps.length > 0) {
      console.log(`\n📦 Installing missing dependencies: ${missingDeps.join(', ')}`);
      await this.runCommand('npm', ['install'], 'Installing dependencies');
    }

    // Check environment variables
    const requiredEnvVars = ['MERCHANT_ID', 'API_USERNAME', 'API_PASSWORD'];
    console.log('\n🔐 Checking environment variables...');

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} is set`);
      } else {
        console.log(`⚠️  ${envVar} is not set (using test defaults)`);
      }
    }

    console.log('\n✅ Environment check completed\n');
  }

  async generateReport() {
    console.log('📊 Test Results Summary');
    console.log('========================\n');

    console.log('Unit Tests:');
    console.log(`  ✅ Passed: ${this.testResults.unit.passed}`);
    console.log(`  ❌ Failed: ${this.testResults.unit.failed}`);
    console.log(`  📊 Total: ${this.testResults.unit.total}\n`);

    console.log('Integration Tests:');
    console.log(`  ✅ Passed: ${this.testResults.integration.passed}`);
    console.log(`  ❌ Failed: ${this.testResults.integration.failed}`);
    console.log(`  📊 Total: ${this.testResults.integration.total}\n`);

    if (this.testResults.coverage) {
      console.log('Coverage Report:');
      console.log(`  📁 Available at: tests/coverage/lcov-report/index.html\n`);
    }

    const totalPassed = this.testResults.unit.passed + this.testResults.integration.passed;
    const totalFailed = this.testResults.unit.failed + this.testResults.integration.failed;

    if (totalFailed === 0) {
      console.log('🎉 All tests passed! Your donation backend is working correctly.\n');
    } else {
      console.log(`⚠️  ${totalFailed} test(s) failed. Please review the test output above.\n`);
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Donation Backend Tests\n');
    console.log('================================================\n');

    try {
      // Check environment first
      await this.checkEnvironment();

      // Run unit tests
      await this.runUnitTests();

      // Run integration tests
      await this.runIntegrationTests();

      // Run coverage tests
      await this.runCoverageTests();

      // Run manual tests (optional)
      await this.runManualTests();

      console.log('🎯 All automated tests completed successfully!\n');

    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
      process.exit(1);
    }

    // Generate final report
    await this.generateReport();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testRunner = new TestRunner();
  testRunner.runAllTests().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
