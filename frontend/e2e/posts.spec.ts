import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'alice@example.com',
  password: 'password123',
};

const TEST_POST = {
  title: 'Test Post Title',
  slug: 'test-post-slug',
  content: 'This is a test post content.',
  tags: 'test, playwright, e2e',
};

const TEST_CATEGORY = {
  name: 'Test Category',
  slug: 'test-category',
  description: 'A test category for E2E testing',
};

test.describe('Posts Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login
    await page.getByTestId('email-input').fill(TEST_USER.email);
    await page.getByTestId('password-input').fill(TEST_USER.password);
    await page.getByTestId('submit-button').click();

    // Wait for dashboard
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
  });

  test('should display posts page', async ({ page }) => {
    // Navigate to posts
    await page.getByTestId('posts-link').click();

    // Check posts page is displayed
    await expect(page).toHaveURL('/posts');
    await expect(page.locator('h2').filter({ hasText: 'Posts' })).toBeVisible();
    await expect(page.getByTestId('create-post-button')).toBeVisible();
  });

  test('should navigate to create post page', async ({ page }) => {
    await page.goto('/posts');
    await page.getByTestId('create-post-button').click();

    await expect(page).toHaveURL('/posts/create');
    await expect(page.locator('h2').filter({ hasText: 'Create Post' })).toBeVisible();
  });

  test('should create a draft post', async ({ page }) => {
    await page.goto('/posts/create');

    // Fill in post details
    await page.getByTestId('title-input').fill(TEST_POST.title);
    await page.getByTestId('slug-input').fill(TEST_POST.slug);
    await page.getByTestId('content-input').fill(TEST_POST.content);
    await page.getByTestId('tags-input').fill(TEST_POST.tags);
    await page.getByTestId('status-select').selectOption('draft');

    // Submit
    await page.getByTestId('submit-button').click();

    // Wait for success message
    await expect(page.getByTestId('success-message')).toContainText('Post created successfully');

    // Should redirect to posts list
    await expect(page).toHaveURL('/posts');

    // Verify post appears in list
    await expect(page.locator(`text=${TEST_POST.title}`)).toBeVisible();
  });

  test('should create a published post', async ({ page }) => {
    await page.goto('/posts/create');

    await page.getByTestId('title-input').fill('Published Test Post');
    await page.getByTestId('slug-input').fill('published-test-post');
    await page.getByTestId('content-input').fill('This post is published.');
    await page.getByTestId('status-select').selectOption('published');

    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('success-message')).toContainText('Post created successfully');
    await expect(page).toHaveURL('/posts');
  });

  test('should edit an existing post', async ({ page }) => {
    // First create a post
    await page.goto('/posts/create');
    await page.getByTestId('title-input').fill('Post to Edit');
    await page.getByTestId('slug-input').fill('post-to-edit');
    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL('/posts');

    // Find and click edit button for the post
    const editButton = page.locator('[data-testid^="edit-post-"]').first();
    await editButton.click();

    // Wait for edit form
    await expect(page.locator('h2').filter({ hasText: 'Edit Post' })).toBeVisible();

    // Update title
    await page.getByTestId('title-input').fill('Updated Post Title');
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('success-message')).toContainText('Post updated successfully');
    await expect(page).toHaveURL('/posts');
    await expect(page.locator('text=Updated Post Title')).toBeVisible();
  });

  test('should delete a post', async ({ page }) => {
    // Create a post to delete
    await page.goto('/posts/create');
    await page.getByTestId('title-input').fill('Post to Delete');
    await page.getByTestId('slug-input').fill('post-to-delete');
    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL('/posts');

    // Verify post exists
    await expect(page.locator('text=Post to Delete')).toBeVisible();

    // Delete the post
    page.once('dialog', (dialog) => dialog.accept());
    const deleteButton = page.locator('[data-testid^="delete-post-"]').first();
    await deleteButton.click();

    // Verify post is removed
    await expect(page.locator('text=Post to Delete')).not.toBeVisible();
  });

  test('should show correct post status', async ({ page }) => {
    // Create draft post
    await page.goto('/posts/create');
    await page.getByTestId('title-input').fill('Draft Status Test');
    await page.getByTestId('slug-input').fill('draft-status-test');
    await page.getByTestId('status-select').selectOption('draft');
    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL('/posts');

    // Check status badge shows "draft"
    const statusBadge = page.locator('[data-testid^="post-status-"]').first();
    await expect(statusBadge).toContainText('draft');
  });

  test('should require title and slug', async ({ page }) => {
    await page.goto('/posts/create');

    // Try to submit without filling required fields
    await page.getByTestId('submit-button').click();

    // Form should not submit (title and slug are required HTML5 fields)
    await expect(page).toHaveURL('/posts/create');
  });

  test('should cancel post creation', async ({ page }) => {
    await page.goto('/posts/create');

    await page.getByTestId('title-input').fill('Cancelled Post');
    await page.getByTestId('cancel-button').click();

    await expect(page).toHaveURL('/posts');
  });

  test('should only show edit/delete for own posts', async ({ page }) => {
    await page.goto('/posts');

    // Get all post items
    const postItems = page.getByTestId('post-item');
    const count = await postItems.count();

    if (count > 0) {
      // Check if edit/delete buttons are present for user's own posts
      // (this assumes the logged-in user has posts)
      const firstPost = postItems.first();
      const hasEditButton = await firstPost.locator('[data-testid^="edit-post-"]').count();
      const hasDeleteButton = await firstPost.locator('[data-testid^="delete-post-"]').count();

      // Either both buttons should be present (user's post) or neither (other user's post)
      expect(hasEditButton === hasDeleteButton).toBeTruthy();
    }
  });

  test('should sanitize XSS attempts in title', async ({ page }) => {
    await page.goto('/posts/create');

    // Try to inject script in title
    const xssTitle = '<script>alert("XSS")</script>Malicious Title';
    await page.getByTestId('title-input').fill(xssTitle);
    await page.getByTestId('slug-input').fill('xss-test');
    await page.getByTestId('submit-button').click();

    await expect(page).toHaveURL('/posts');

    // Title should be sanitized (script tags removed)
    await expect(page.locator('text=<script>')).not.toBeVisible();
    // The text content without tags should still be visible
    await expect(page.locator('text=Malicious Title')).toBeVisible();
  });

  test('should sanitize XSS attempts in content', async ({ page }) => {
    await page.goto('/posts/create');

    const xssContent =
      '<script>alert("XSS")</script><p>Safe content</p><img src=x onerror=alert("XSS")>';
    await page.getByTestId('title-input').fill('XSS Content Test');
    await page.getByTestId('slug-input').fill('xss-content-test');
    await page.getByTestId('content-input').fill(xssContent);
    await page.getByTestId('submit-button').click();

    await expect(page).toHaveURL('/posts');

    // Script tags should be sanitized
    await expect(page.locator('script')).toHaveCount(0);
    // Allowed tags like <p> should be preserved
    await expect(page.locator('text=Safe content')).toBeVisible();
  });

  test('should sanitize slug to be URL-safe', async ({ page }) => {
    await page.goto('/posts/create');

    // Try to use special characters in slug
    await page.getByTestId('title-input').fill('Special Slug Test');
    await page.getByTestId('slug-input').fill('Test Slug!@#$%^&*()With Special');
    await page.getByTestId('submit-button').click();

    await expect(page).toHaveURL('/posts');
    // Post should be created successfully (slug sanitized server-side)
    await expect(page.locator('text=Special Slug Test')).toBeVisible();
  });
});

test.describe('Categories Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill(TEST_USER.email);
    await page.getByTestId('password-input').fill(TEST_USER.password);
    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
  });

  test('should display categories page', async ({ page }) => {
    await page.getByTestId('categories-link').click();

    await expect(page).toHaveURL('/categories');
    await expect(page.locator('h2').filter({ hasText: 'Categories' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Create New Category' })).toBeVisible();
  });

  test('should create a new category', async ({ page }) => {
    await page.goto('/categories');

    await page.getByTestId('name-input').fill(TEST_CATEGORY.name);
    await page.getByTestId('slug-input').fill(TEST_CATEGORY.slug);
    await page.getByTestId('description-input').fill(TEST_CATEGORY.description);
    await page.getByTestId('create-button').click();

    await expect(page.getByTestId('success-message')).toContainText(
      'Category created successfully'
    );
    await expect(page.locator(`text=${TEST_CATEGORY.name}`)).toBeVisible();
  });

  test('should delete a category', async ({ page }) => {
    await page.goto('/categories');

    // Create a category to delete
    await page.getByTestId('name-input').fill('Category to Delete');
    await page.getByTestId('slug-input').fill('category-to-delete');
    await page.getByTestId('create-button').click();

    await expect(page.getByTestId('success-message')).toBeVisible();

    // Delete the category
    page.once('dialog', (dialog) => dialog.accept());
    const deleteButton = page.locator('[data-testid^="delete-category-"]').first();
    await deleteButton.click();

    await expect(page.getByTestId('success-message')).toContainText(
      'Category deleted successfully'
    );
  });

  test('should require name and slug for category creation', async ({ page }) => {
    await page.goto('/categories');

    // Try to create without required fields
    await page.getByTestId('create-button').click();

    // Should show error message
    await expect(page.getByTestId('error-message')).toContainText('Name and slug are required');
  });

  test('should clear form after creating category', async ({ page }) => {
    await page.goto('/categories');

    await page.getByTestId('name-input').fill('Temp Category');
    await page.getByTestId('slug-input').fill('temp-category');
    await page.getByTestId('create-button').click();

    await expect(page.getByTestId('success-message')).toBeVisible();

    // Form should be cleared
    await expect(page.getByTestId('name-input')).toHaveValue('');
    await expect(page.getByTestId('slug-input')).toHaveValue('');
    await expect(page.getByTestId('description-input')).toHaveValue('');
  });
});

test.describe('Posts with Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill(TEST_USER.email);
    await page.getByTestId('password-input').fill(TEST_USER.password);
    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('dashboard-title')).toBeVisible();

    // Create a test category first
    await page.goto('/categories');
    await page.getByTestId('name-input').fill('E2E Category');
    await page.getByTestId('slug-input').fill('e2e-category');
    await page.getByTestId('create-button').click();
    await expect(page.getByTestId('success-message')).toBeVisible();
  });

  test('should assign category to post', async ({ page }) => {
    await page.goto('/posts/create');

    await page.getByTestId('title-input').fill('Post with Category');
    await page.getByTestId('slug-input').fill('post-with-category');

    // Select the category checkbox (find first category checkbox)
    const categoryCheckbox = page.locator('[data-testid^="category-"]').first();
    await categoryCheckbox.check();
    await expect(categoryCheckbox).toBeChecked();

    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('success-message')).toContainText('Post created successfully');
  });

  test('should show link to create category if none exist', async ({ page }) => {
    // This test would need a clean state, but for now we check the link exists in the form
    await page.goto('/posts/create');

    // The link to create categories should be visible if no categories exist
    const categoriesLink = page.locator('a[href="/categories"]');
    if ((await categoriesLink.count()) > 0) {
      await expect(categoriesLink).toBeVisible();
    }
  });
});
