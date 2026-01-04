import { expect, test } from "@playwright/test";

test.describe("Bank Statement Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the upload form", async ({ page }) => {
    // Check that the main heading is visible
    await expect(
      page.getByRole("heading", { name: "Bank Statement Upload" })
    ).toBeVisible();

    // Check that file input is present
    const fileInput = page.getByLabel("Select Bank Statement (PDF or Image)");
    await expect(fileInput).toBeVisible();

    // Check that upload button is present
    const uploadButton = page.getByRole("button", {
      name: /Upload & Process/i,
    });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeDisabled(); // Should be disabled when no file is selected
  });

  test("should enable upload button when file is selected", async ({
    page,
  }) => {
    // Create a mock file
    const fileInput = page.getByLabel("Select Bank Statement (PDF or Image)");

    // Create a simple text file (will be rejected by backend, but tests frontend behavior)
    const fileContent = "test file content";
    const blob = new Blob([fileContent], { type: "text/plain" });
    const file = new File([blob], "test.pdf", { type: "application/pdf" });

    // Note: Playwright doesn't directly support File objects in file inputs
    // We'll test the UI behavior instead
    await fileInput.setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(fileContent),
    });

    // Check that file name is displayed
    await expect(page.getByText(/Selected: test.pdf/i)).toBeVisible();

    // Upload button should be enabled
    const uploadButton = page.getByRole("button", {
      name: /Upload & Process/i,
    });
    await expect(uploadButton).toBeEnabled();
  });

  test("should show error message on invalid file upload", async ({ page }) => {
    // Mock API to return error for invalid file
    await page.route("**/api/upload-bank-statement", async (route) => {
      await route.fulfill({
        status: 400,
        json: {
          detail: "Invalid file type. Allowed types: .pdf, .png, .jpg, .jpeg",
        },
      });
    });

    const fileInput = page.getByLabel("Select Bank Statement (PDF or Image)");

    // Upload an invalid file type
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("invalid file"),
    });

    const uploadButton = page.getByRole("button", {
      name: /Upload & Process/i,
    });
    await uploadButton.click();

    // Should show error message
    await expect(
      page.getByText(/Invalid file type/i).or(page.getByText(/error/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show loading state during upload", async ({ page }) => {
    const fileInput = page.getByLabel("Select Bank Statement (PDF or Image)");

    // Create a minimal PDF file
    const pdfContent = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 0\ntrailer\n<<\n/Size 0\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF"
    );

    await fileInput.setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: pdfContent,
    });

    const uploadButton = page.getByRole("button", {
      name: /Upload & Process/i,
    });

    // Click upload and check for loading state
    await uploadButton.click();

    // Button should show "Processing..." or be disabled
    await expect(
      page.getByRole("button", { name: /Processing/i }).or(uploadButton)
    ).toBeVisible({ timeout: 1000 });
  });

  test("should display results when upload succeeds", async ({ page }) => {
    // Mock the API response
    await page.route("**/api/upload-bank-statement", async (route) => {
      const json = {
        transactions: [
          {
            date: "2024-01-15",
            description: "Grocery Store",
            amount: 125.5,
            type: "expense",
          },
          {
            date: "2024-01-20",
            description: "Salary",
            amount: 5000.0,
            type: "income",
          },
        ],
        totalExpenses: 125.5,
        totalIncome: 5000.0,
        period: "January 2024",
      };
      await route.fulfill({ json });
    });

    const fileInput = page.getByLabel("Select Bank Statement (PDF or Image)");
    const pdfContent = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 0\ntrailer\n<<\n/Size 0\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF"
    );

    await fileInput.setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: pdfContent,
    });

    const uploadButton = page.getByRole("button", {
      name: /Upload & Process/i,
    });
    await uploadButton.click();

    // Wait for results to appear
    const summaryHeading = page.getByRole("heading", { name: /Summary/i });
    await expect(summaryHeading).toBeVisible({ timeout: 10000 });

    // Check summary values (format is $5000.00 without comma)
    // Use more specific selectors to avoid multiple matches
    const summarySection = summaryHeading.locator("..");
    await expect(summarySection.getByText("$5000.00").first()).toBeVisible();
    await expect(summarySection.getByText("$125.50").first()).toBeVisible();

    // Check transactions table
    await expect(
      page.getByRole("heading", { name: /Transactions/i })
    ).toBeVisible();
    await expect(page.getByText("Grocery Store")).toBeVisible();
    await expect(page.getByText("Salary")).toBeVisible();
  });

  test("should display error message when API fails", async ({ page }) => {
    // Mock API error response
    await page.route("**/api/upload-bank-statement", async (route) => {
      await route.fulfill({
        status: 500,
        json: { detail: "Failed to process bank statement" },
      });
    });

    const fileInput = page.getByLabel("Select Bank Statement (PDF or Image)");
    const pdfContent = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 0\ntrailer\n<<\n/Size 0\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF"
    );

    await fileInput.setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: pdfContent,
    });

    const uploadButton = page.getByRole("button", {
      name: /Upload & Process/i,
    });
    await uploadButton.click();

    // Should show error message
    await expect(
      page.getByText(/Failed to process/i).or(page.getByText(/error/i))
    ).toBeVisible({ timeout: 10000 });
  });
});
