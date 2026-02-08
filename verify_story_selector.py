from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173")
        page.wait_for_selector("text=Aventure Lecture")

        # Take a screenshot of the initial state
        page.screenshot(path="verification_initial.png")

        # Find the first listen button
        listen_button = page.locator("button[title='Écouter la description']").first
        if listen_button.is_visible():
            print("Listen button found!")
            # Click it to see if icon changes (Volume2 -> StopCircle)
            listen_button.click()
            page.wait_for_timeout(1000) # Wait for state update
            page.screenshot(path="verification_playing.png")
        else:
            print("Listen button NOT found!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
