/**
 * This file has been refactored into smaller, more focused hooks.
 * See src/hooks/design/index.ts for the implementation.
 *
 * The refactoring fixes an issue with loading saved designs by ensuring
 * they properly bypass the theme selection flow and go directly to the
 * customization stage.
 */

// Re-export everything from the new implementation
export * from "./design";
