import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_SEEN_KEY = 'doc-to-html-tour-seen-v1';

export function hasSeenOnboardingTour() {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingTourSeen() {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export function startOnboardingTour() {
  const tour = driver({
    showProgress: true,
    animate: true,
    overlayOpacity: 0.5,
    allowClose: true,
    doneBtnText: 'Done',
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    steps: [
      {
        element: '#tour-upload-button',
        popover: {
          title: 'Step 1: Upload file',
          description: 'Upload a .docx file to start the conversion process.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-convert-button',
        popover: {
          title: 'Step 2: Convert',
          description: 'Click Convert to process the Word file into HTML content.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#tour-sidebar-options',
        popover: {
          title: 'Step 3: Choose options in the Sidebar',
          description: 'Adjust cleaning and formatting options before exporting the result.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-preview-tab',
        popover: {
          title: 'Step 4: View results in Live Preview',
          description: 'Switch to Live Preview or Split View to see the rendered HTML.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-code-output',
        popover: {
          title: 'Step 5: Check Code Output',
          description: 'Inspect and edit the generated HTML code directly in this panel.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#tour-download-button',
        popover: {
          title: 'Step 6: Download or Copy',
          description: 'Once conversion data is available, you can download the file or copy the HTML to clipboard.',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
    onDestroyed: markOnboardingTourSeen,
    // Also mark as seen if the user closes or resets the tour early
    onClose: markOnboardingTourSeen,
    onReset: markOnboardingTourSeen,
  });

  tour.drive();
}
