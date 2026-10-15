const dashboardFullscreenButton = document.getElementById(
  "dashboardFullscreenButton"
);

const windowBackdrop = document.getElementById("windowBackdrop");
const appWindow = document.getElementById("appWindow");

const windowTitle = document.getElementById("windowTitle");
const windowFrame = document.getElementById("windowFrame");

const windowFullscreenButton = document.getElementById(
  "windowFullscreenButton"
);

const windowCloseButton = document.getElementById(
  "windowCloseButton"
);

const windowCards = document.querySelectorAll(
  "[data-window-url]"
);


/* FULLSCREEN STATE */

let restoreDashboardFullscreen = false;
let restoringDashboardFullscreen = false;


/* DASHBOARD FULLSCREEN */

async function toggleDashboardFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  } catch (error) {
    console.error("Fullscreen request failed:", error);
  }
}

dashboardFullscreenButton.addEventListener(
  "click",
  toggleDashboardFullscreen
);


/* OPEN WINDOW */

function openWindow(title, url) {
  windowTitle.textContent = title;
  windowFrame.src = url;

  windowBackdrop.classList.add("open");
  windowBackdrop.setAttribute("aria-hidden", "false");

  document.body.classList.add("window-open");
}


/* CLOSE WINDOW */

async function closeWindow() {
  if (document.fullscreenElement === appWindow) {
    try {
      restoreDashboardFullscreen = false;

      await document.exitFullscreen();
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }

  windowBackdrop.classList.remove("open");
  windowBackdrop.setAttribute("aria-hidden", "true");

  document.body.classList.remove("window-open");

  windowFrame.src = "";
}


/* OPEN CARD WINDOWS */

windowCards.forEach((card) => {
  card.addEventListener("click", () => {
    const title = card.dataset.windowTitle;
    const url = card.dataset.windowUrl;

    openWindow(title, url);
  });
});


/* WINDOW FULLSCREEN */

async function toggleWindowFullscreen() {
  try {

    /*
     * EXIT WINDOW FULLSCREEN
     */

    if (document.fullscreenElement === appWindow) {
      await document.exitFullscreen();

      return;
    }


    /*
     * REMEMBER IF DASHBOARD
     * WAS ALREADY FULLSCREEN
     */

    restoreDashboardFullscreen =
      document.fullscreenElement === document.documentElement;


    /*
     * EXIT DASHBOARD FULLSCREEN
     * BEFORE OPENING WINDOW FULLSCREEN
     */

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }


    /*
     * ENTER WINDOW FULLSCREEN
     */

    await appWindow.requestFullscreen();

  } catch (error) {
    console.error(
      "Window fullscreen request failed:",
      error
    );
  }
}

windowFullscreenButton.addEventListener(
  "click",
  toggleWindowFullscreen
);


/* CLOSE BUTTON */

windowCloseButton.addEventListener(
  "click",
  closeWindow
);


/* CLICK OUTSIDE WINDOW */

windowBackdrop.addEventListener("click", (event) => {
  if (event.target === windowBackdrop) {
    closeWindow();
  }
});


/* KEYBOARD */

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    windowBackdrop.classList.contains("open") &&
    !document.fullscreenElement
  ) {
    closeWindow();
  }
});


/* FULLSCREEN CHANGE */

document.addEventListener(
  "fullscreenchange",
  async () => {

    const dashboardIsFullscreen =
      document.fullscreenElement === document.documentElement;

    const windowIsFullscreen =
      document.fullscreenElement === appWindow;


    /*
     * RESTORE DASHBOARD FULLSCREEN
     *
     * If the window was opened while the dashboard
     * was fullscreen, restore dashboard fullscreen
     * after leaving window fullscreen.
     */

    if (
      !document.fullscreenElement &&
      restoreDashboardFullscreen &&
      !restoringDashboardFullscreen
    ) {
      try {
        restoringDashboardFullscreen = true;

        await document.documentElement.requestFullscreen();

        restoreDashboardFullscreen = false;
      } catch (error) {
        console.error(
          "Failed to restore dashboard fullscreen:",
          error
        );
      } finally {
        restoringDashboardFullscreen = false;
      }
    }


    /*
     * DASHBOARD BUTTON
     */

    const dashboardActive =
      document.fullscreenElement === document.documentElement;

    dashboardFullscreenButton.innerHTML =
      dashboardActive
        ? '<span class="fullscreen-icon">⛶</span> Exit Fullscreen'
        : '<span class="fullscreen-icon">⛶</span> Fullscreen';


    /*
     * WINDOW BUTTON
     */

    const windowActive =
      document.fullscreenElement === appWindow;

    windowFullscreenButton.textContent =
      windowActive ? "↙" : "⛶";

    windowFullscreenButton.title =
      windowActive
        ? "Exit fullscreen"
        : "Fullscreen";

    windowFullscreenButton.setAttribute(
      "aria-label",
      windowActive
        ? "Exit window fullscreen"
        : "Toggle window fullscreen"
    );
  }
);
