import js from '@eslint/js';

export default [
    js.configs.recommended,

    {
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'warn',
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'indent': ['error', 4],
            'no-multi-spaces': ['error']
        }
    }
];