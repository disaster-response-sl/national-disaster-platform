#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Donation API
 * Runs all test suites with proper setup and teardown
 */

const { spawn } = require('child_process');
const path = require('path');

class TestRunner {
  constructor() {
    this.testResults = {
      unit: null,
      integration: null,
      performance: null,
      security: null,
      coverage: null
    };
  }

  async runCommand(command, args = [], description = '') {
    return new Promise((resolve, reject) => {
      console.log(`\n🚀 Running: ${description || command}`);
      console.log('='.repeat(50));

      const child = spawn(command, args, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${description || command} completed successfully\n`);
          resolve(code);
        } else {
          console.log(`❌ ${description || command} failed with code ${code}\n`);
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error(`❌ Error running ${command}:`, error);
        reject(error);
      });
    });
  }

  async installDependencies() {
    try {
      await this.runCommand('npm', ['install'], 'Installing dependencies');
      return true;
    } catch (error) {
      console.error('Failed to install dependencies:', error.message);
      return false;
    }
  }

  async runUnitTests() {
    try {
      await this.runCommand('npm', ['run', 'test:unit'], 'Unit Tests');
      this.testResults.unit = 'PASSED';
      return true;
    } catch (error) {
      this.testResults.unit = 'FAILED';
      return false;
    }
  }

  async runIntegrationTests() {
    try {
      await this.runCommand('npm', ['run', 'test:integration'], 'Integration Tests');
      this.testResults.integration = 'PASSED';
      return true;
    } catch (error) {
      this.testResults.integration = 'FAILED';
      return false;
    }
  }

  async runPerformanceTests() {
    try {
      await this.runCommand('npm', ['run', 'test:performance'], 'Performance Tests');
      this.testResults.performance = 'PASSED';
      return true;
    } catch (error) {
      this.testResults.performance = 'FAILED';
      return false;
    }
  }

  async runSecurityTests() {
    try {
      await this.runCommand('npm', ['run', 'test:security'], 'Security Tests');
      this.testResults.security = 'PASSED';
      return true;
    } catch (error) {
      this.testResults.security = 'FAILED';
      return false;
    }
  }

  async runCoverageTests() {
    try {
      await this.runCommand('npm', ['run', 'test:coverage'], 'Coverage Tests');
      this.testResults.coverage = 'PASSED';
      return true;
    } catch (error) {
      this.testResults.coverage = 'FAILED';
      return false;
    }
  }

  async runAllTests() {
    try {
      await this.runCommand('npm', ['run', 'test:all'], 'All Tests');
      return true;
    } catch (error) {
      return false;
    }
  }

  printResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));

    const results = Object.entries(this.testResults);
    results.forEach(([test, result]) => {
      const status = result === 'PASSED' ? '✅' : result === 'FAILED' ? '❌' : '⏭️';
      console.log(`${status} ${test.charAt(0).toUpperCase() + test.slice(1)}: ${result || 'SKIPPED'}`);
    });

    const passed = results.filter(([, result]) => result === 'PASSED').length;
    const total = results.length;

    console.log(`\n🎯 Overall: ${passed}/${total} test suites passed`);

    if (passed === total) {
      console.log('🎉 All tests passed! Your donation API is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.');
    }
  }

  async run(options = {}) {
    const {
      install = true,
      unit = true,
      integration = true,
      performance = false, // Performance tests can be slow
      security = true,
      coverage = false,
      all = false
    } = options;

    console.log('🧪 DONATION API COMPREHENSIVE TEST SUITE');
    console.log('==========================================');

    try {
      // Install dependencies
      if (install) {
        const installSuccess = await this.installDependencies();
        if (!installSuccess) {
          throw new Error('Failed to install dependencies');
        }
      }

      // Run tests
      if (all) {
        await this.runAllTests();
      } else {
        if (unit) await this.runUnitTests();
        if (integration) await this.runIntegrationTests();
        if (performance) await this.runPerformanceTests();
        if (security) await this.runSecurityTests();
        if (coverage) await this.runCoverageTests();
      }

    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
    } finally {
      this.printResults();
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach(arg => {
    if (arg === '--no-install') options.install = false;
    if (arg === '--unit-only') {
      options.unit = true;
      options.integration = false;
      options.security = false;
    }
    if (arg === '--performance') options.performance = true;
    if (arg === '--coverage') options.coverage = true;
    if (arg === '--all') options.all = true;
  });

  const runner = new TestRunner();
  runner.run(options);
}

module.exports = TestRunner;
