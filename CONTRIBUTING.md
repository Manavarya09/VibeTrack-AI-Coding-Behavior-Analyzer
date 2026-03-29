# Contributing to VibeTrack

Thank you for your interest in contributing to VibeTrack!

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include detailed steps to reproduce
4. Include your environment details

### Suggesting Features

1. Check existing issues and PRs
2. Use the feature request template
3. Explain why this feature would be useful
4. Provide examples of how it should work

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Commit with clear messages: `git commit -m "Add amazing feature"`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Commit Message Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Manavarya09/VibeTrack-AI-Coding-Behavior-Analyzer.git
cd VibeTrack

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Run development servers
# Terminal 1: cd backend && uvicorn main:app --reload
# Terminal 2: cd frontend && npm run dev
```

### Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend build
cd frontend
npm run build
```

### Coding Standards

- Python: Follow PEP 8, use type hints
- JavaScript/React: Use ES6+, functional components with hooks
- Use meaningful variable and function names
- Comment complex logic
- Keep functions small and focused

## Review Process

1. All submissions require review
2. Address feedback promptly
3. Keep changes focused and atomic

## Recognition

Contributors will be acknowledged in the README and release notes.

---

Questions? Open an issue for discussion before starting major changes.
