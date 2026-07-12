import { expect, test } from '@playwright/test';

const demos = ['1', '2', '3'] as const;
const pages = [
  'index.html',
  'services.html',
  'buying-selling.html',
  'our-brands.html',
  'about.html',
  'contact.html',
  'booking.html',
  'thanks-for-booking.html',
  '404.html',
] as const;

for (const demo of demos) {
  test.describe(`Bottle Lake Bikes demo ${demo}`, () => {
    for (const pageName of pages) {
      test(`${pageName} is complete at phone and desktop widths`, async ({ page }) => {
        const badLocalResponses: string[] = [];
        let internalLinks: string[] = [];

        await page.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (url.hostname === '127.0.0.1') {
            await route.continue();
          } else {
            await route.abort();
          }
        });

        page.on('response', (response) => {
          const url = new URL(response.url());
          if (url.hostname === '127.0.0.1' && response.status() >= 400) {
            badLocalResponses.push(`${response.status()} ${url.pathname}`);
          }
        });

        for (const viewport of [
          { width: 375, height: 812 },
          { width: 1440, height: 900 },
        ]) {
          await page.setViewportSize(viewport);
          const response = await page.goto(`/demo/${demo}/${pageName}`, {
            waitUntil: 'domcontentloaded',
          });

          expect(response, 'page should return a response').not.toBeNull();
          expect(response!.status(), 'page should load successfully').toBeLessThan(400);
          await expect(page.locator('main')).toBeVisible();
          await expect(page.locator('h1')).toHaveCount(1);

          await page.locator('img').evaluateAll(async (images) => {
            await Promise.all(
              images.map(
                (image) =>
                  new Promise<void>((resolve) => {
                    image.loading = 'eager';
                    if (image.complete) {
                      resolve();
                      return;
                    }
                    const finish = () => resolve();
                    image.addEventListener('load', finish, { once: true });
                    image.addEventListener('error', finish, { once: true });
                    window.setTimeout(finish, 2_000);
                  }),
              ),
            );
          });

          const audit = await page.evaluate(() => {
            const brokenImages = Array.from(document.images)
              .filter((image) => image.complete && image.naturalWidth === 0)
              .map((image) => image.getAttribute('src') || '(missing src)');
            const missingAlt = Array.from(document.images)
              .filter((image) => !image.hasAttribute('alt'))
              .map((image) => image.getAttribute('src') || '(missing src)');
            const deadLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
              .filter((link) => {
                const href = link.getAttribute('href')?.trim().toLowerCase() || '';
                return href === '#' || href.startsWith('javascript:');
              })
              .map((link) => link.textContent?.trim() || link.getAttribute('href') || '(unnamed link)');
            const unlabeledFields = Array.from(
              document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
                'input:not([type="hidden"]), select, textarea',
              ),
            )
              .filter((field) => {
                if (field.getAttribute('aria-hidden') === 'true') return false;
                if (field.getAttribute('aria-label') || field.getAttribute('aria-labelledby')) return false;
                return !field.id || !document.querySelector(`label[for="${CSS.escape(field.id)}"]`);
              })
              .map((field) => field.id || field.name || field.tagName.toLowerCase());
            const unlabeledButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
              .filter(
                (button) =>
                  !button.textContent?.trim() &&
                  !button.getAttribute('aria-label') &&
                  !button.getAttribute('aria-labelledby') &&
                  !button.getAttribute('title'),
              )
              .map((button) => button.className || button.type || '(unnamed button)');
            const headingLevels = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
              (heading) => Number(heading.tagName.slice(1)),
            );
            const headingSkips = headingLevels.filter(
              (level, index) => index > 0 && level > headingLevels[index - 1] + 1,
            );
            const bodyText = document.body.innerText;

            return {
              brokenImages,
              missingAlt,
              deadLinks,
              unlabeledFields,
              unlabeledButtons,
              headingSkips,
              horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
              language: document.documentElement.lang,
              title: document.title.trim(),
              staleLaunchCopy: /opens\s+thursday,?\s+april\s+16/i.test(bodyText),
              placeholderCopy: /\b(?:lorem ipsum|coming soon|under construction)\b/i.test(bodyText),
            };
          });

          expect(audit.title).not.toBe('');
          expect(audit.language.toLowerCase()).toMatch(/^en(?:-|$)/);
          expect(audit.brokenImages).toEqual([]);
          expect(audit.missingAlt).toEqual([]);
          expect(audit.deadLinks).toEqual([]);
          expect(audit.unlabeledFields).toEqual([]);
          expect(audit.unlabeledButtons).toEqual([]);
          expect(audit.headingSkips).toEqual([]);
          expect(audit.horizontalOverflow).toBeLessThanOrEqual(2);
          expect(audit.staleLaunchCopy).toBe(false);
          expect(audit.placeholderCopy).toBe(false);

          if (viewport.width === 1440) {
            internalLinks = await page.evaluate(() =>
              Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
                .map((link) => link.href)
                .filter((href) => {
                  const url = new URL(href);
                  return url.origin === window.location.origin && !url.pathname.endsWith('/');
                }),
            );
          }
        }

        for (const href of new Set(internalLinks)) {
          const linkedResponse = await page.request.get(href);
          expect(linkedResponse.status(), `linked page should resolve: ${href}`).toBeLessThan(400);
        }
        expect(badLocalResponses).toEqual([]);
      });
    }

    test('mobile navigation opens, closes, and returns focus', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`/demo/${demo}/index.html`, { waitUntil: 'domcontentloaded' });

      const toggle = page.locator('.nav-toggle:visible, .tool-dock__menu:visible').first();
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');

      const controls = await toggle.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator(`#${controls}`)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toBeFocused();
    });
  });
}
