# 🤝 Contributing to FakeVerifier

Thank you for your interest in contributing to FakeVerifier! This document provides comprehensive guidelines for contributing to our AI-powered news credibility verification platform.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing Guidelines](#testing-guidelines)
- [API Integration Guidelines](#api-integration-guidelines)
- [UI/UX Guidelines](#uiux-guidelines)
- [Security Guidelines](#security-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Pull Request Process](#pull-request-process)
- [Code Review Process](#code-review-process)
- [Release Process](#release-process)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **pnpm** (v8.0.0 or higher)
- **Git** (v2.30.0 or higher)
- **TypeScript** (v5.0.0 or higher)

### Required Accounts & API Keys

To run the project locally, you'll need:

1. **Firebase Project** - For authentication and database
2. **OpenAI API Key** - For AI content analysis
3. **News API Keys**:
   - News API
   - NewsAPI.ai
   - Finlight API
   - New York Times API

> **Note**: For development, you can use test API keys or mock data. Production keys should never be committed to the repository.

## 🛠 Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/pdevulapally/fakeverifier-website.git
cd fakeverifier-website
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (recommended)
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# News APIs
NEWS_API_KEY=your_news_api_key
NEWSAPI_AI_KEY=your_newsapi_ai_key
FINLIGHT_API_KEY=your_finlight_api_key
NYT_API_KEY=your_nyt_api_key

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app-domain.com
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev
# or
pnpm dev
```

The application will be available at your configured domain

## 📁 Project Structure

```
fakeverifier-website/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── public/               # Static assets
├── styles/               # Additional stylesheets
├── types/                # TypeScript type definitions
└── docs/                 # Documentation
```

## 📝 Coding Standards

### TypeScript Guidelines

- **Strict Mode**: Always use TypeScript in strict mode
- **Type Definitions**: Define explicit types for all functions and variables
- **Interfaces**: Use interfaces for object shapes and API responses
- **Enums**: Use enums for constants and status values

```typescript
// ✅ Good
interface VerificationResult {
  score: number;
  confidence: number;
  explanation: string;
  sources: NewsSource[];
}

// ❌ Avoid
const result: any = { score: 0.8 };
```

### React Guidelines

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define props interface for each component
- **Error Boundaries**: Implement error boundaries for critical components
- **Performance**: Use React.memo, useMemo, and useCallback when appropriate

```typescript
// ✅ Good
interface VerificationFormProps {
  onSubmit: (data: VerificationData) => void;
  isLoading?: boolean;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  // Component logic
};
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `VerificationForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useVerification.ts`)
- **Utilities**: camelCase (e.g., `apiHelpers.ts`)
- **Types**: PascalCase (e.g., `VerificationTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## 🔄 Git Workflow

### Branch Naming Convention

Use the following format for branch names:

```
<type>/<description>
```

Types:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Adding or updating tests

Examples:
- `feature/ai-analysis-improvement`
- `bugfix/verification-api-error`
- `docs/contributing-guidelines`

### Commit Message Format

Use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(verification): add confidence scoring algorithm
fix(api): resolve news API rate limiting issue
docs(readme): update installation instructions
```

## 🧪 Testing Guidelines

### Unit Testing

- Use **Jest** and **React Testing Library** for unit tests
- Test all utility functions and custom hooks
- Mock external API calls and Firebase services
- Aim for 80%+ code coverage

```typescript
// Example test structure
describe('VerificationService', () => {
  it('should analyze content and return verification result', async () => {
    const mockContent = 'Sample news content';
    const result = await analyzeContent(mockContent);
    
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('confidence');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
```

### Integration Testing

- Test API routes with proper request/response handling
- Test authentication flows
- Test database operations
- Use test databases for integration tests

### E2E Testing

- Use **Playwright** for end-to-end testing
- Test critical user journeys
- Test responsive design across devices
- Test accessibility features

## 🔌 API Integration Guidelines

### News API Integration

When adding new news APIs:

1. **Create API Client**: Implement in `lib/api/` directory
2. **Type Definitions**: Define response types in `types/`
3. **Error Handling**: Implement proper error handling and retry logic
4. **Rate Limiting**: Respect API rate limits
5. **Caching**: Implement caching for frequently requested data

```typescript
// Example API client structure
export class NewsAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async searchArticles(query: string): Promise<Article[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&apiKey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformResponse(data);
    } catch (error) {
      console.error('News API error:', error);
      throw error;
    }
  }
}
```

### OpenAI Integration

- Implement proper prompt engineering
- Handle API rate limits and quotas
- Cache responses when appropriate
- Implement fallback strategies

## 🎨 UI/UX Guidelines

### Design System

- Follow the existing design system using Shadcn/ui components
- Use Tailwind CSS utility classes consistently
- Maintain accessibility standards (WCAG 2.1 AA)
- Support both light and dark themes

### Component Guidelines

- Create reusable, composable components
- Implement proper loading states
- Handle error states gracefully
- Ensure responsive design

```typescript
// Example component structure
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick
}) => {
  // Component implementation
};
```

## 🔒 Security Guidelines

### API Key Management

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Implement proper key rotation procedures
- Use different keys for development and production

### Data Protection

- Validate all user inputs
- Implement proper CORS policies
- Use HTTPS in production
- Sanitize data before storing in database

### Authentication

- Implement proper session management
- Use secure authentication methods
- Implement rate limiting for auth endpoints
- Log security events appropriately

## 📚 Documentation

### Code Documentation

- Document all public functions and classes
- Use JSDoc comments for complex functions
- Include examples in documentation
- Keep documentation up-to-date

```typescript
/**
 * Analyzes the credibility of news content using AI
 * @param content - The news content to analyze
 * @param options - Analysis options
 * @returns Promise<VerificationResult> - Analysis result with score and explanation
 * @example
 * const result = await analyzeContent('Breaking news about...');
 * console.log(result.score); // 0.85
 */
export async function analyzeContent(
  content: string,
  options?: AnalysisOptions
): Promise<VerificationResult> {
  // Implementation
}
```

### README Updates

- Update README.md when adding new features
- Include setup instructions for new dependencies
- Document breaking changes
- Provide usage examples

## 🐛 Issue Reporting

### Before Reporting

1. Check existing issues for duplicates
2. Search documentation for solutions
3. Test with the latest version
4. Reproduce the issue in a clean environment

### Issue Template

Use the following template when reporting issues:

```markdown
## Bug Report

### Description
Brief description of the issue

### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

### Expected Behavior
What you expected to happen

### Actual Behavior
What actually happened

### Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 120, Firefox 119]
- Node.js Version: [e.g., 18.17.0]
- Package Manager: [e.g., npm 9.6.7]

### Additional Information
- Screenshots (if applicable)
- Console errors (if applicable)
- Network tab information (if applicable)
```

## 🔄 Pull Request Process

### Before Submitting

1. **Fork the repository** and create a feature branch
2. **Install dependencies** and run tests
3. **Make your changes** following coding standards
4. **Write/update tests** for new functionality
5. **Update documentation** as needed
6. **Test thoroughly** in different environments

### PR Template

Use the following template for pull requests:

```markdown
## Pull Request

### Description
Brief description of changes

### Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

### Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation made
- [ ] No new warnings generated
- [ ] Added tests that prove fix is effective or feature works
- [ ] All dependent changes have been merged and published

### Screenshots (if applicable)
Add screenshots to help explain your changes

### Additional Notes
Any additional information or context
```

## 👥 Code Review Process

### Review Guidelines

- **Be constructive** and respectful in feedback
- **Focus on code quality** and maintainability
- **Check for security issues** and best practices
- **Ensure tests are adequate** and passing
- **Verify documentation** is updated

### Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

## 🚀 Release Process

### Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md with release notes
- Tag releases in Git
- Deploy to staging before production

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Staging deployment successful
- [ ] Production deployment successful

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Provide constructive feedback**
- **Follow project guidelines**
- **Report inappropriate behavior**

### Communication

- Use GitHub Issues for bug reports and feature requests
- Use GitHub Discussions for questions and ideas
- Be clear and concise in communications
- Use appropriate labels and milestones

### Recognition

- Contributors will be recognized in the README
- Significant contributions will be highlighted in release notes
- Maintainers will provide guidance and support

## 📞 Getting Help

If you need help with contributing:

1. **Check the documentation** first
2. **Search existing issues** for similar problems
3. **Ask in GitHub Discussions**
4. **Contact maintainers** for urgent issues

## 🎯 Contribution Areas

We welcome contributions in these areas:

- **Frontend Development**: React components, UI/UX improvements
- **Backend Development**: API routes, database optimization
- **AI/ML**: Prompt engineering, analysis algorithms
- **Testing**: Unit tests, integration tests, E2E tests
- **Documentation**: README updates, API documentation
- **DevOps**: CI/CD improvements, deployment automation
- **Security**: Security audits, vulnerability fixes
- **Performance**: Optimization, caching strategies

## 📄 License

By contributing to FakeVerifier, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to FakeVerifier! Your efforts help make the internet a more trustworthy place. 🌟

