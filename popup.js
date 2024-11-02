document.addEventListener("DOMContentLoaded", function () {
  const tabList = document.getElementById("tab-list");
  const tabCountDisplay = document.getElementById("tab_count");
  const toggleButton = document.getElementById("darkModeToggle");
  const searchInput = document.getElementById("searchInput");

  searchInput.focus();

  function themeMode() {
    toggleButton.checked = localStorage.getItem("tab_viewer_theme") === "dark";
  }

  function renderTabs(searchTerm = "") {
    // Get the current window ID
    chrome.windows.getCurrent({ populate: true }, function (currentWindow) {
      const currentWindowId = currentWindow.id; // Current window ID

      // Query all tabs but filter them by the current window ID
      chrome.tabs.query({ windowId: currentWindowId }, function (tabs) {
        const filteredTabs = tabs.filter(
          (tab) =>
            tab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tab.url.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const totalTabs = tabs.length; // Total number of tabs in the current window
        const filteredCount = filteredTabs.length; // Count of filtered tabs

        // Update tab count display
        tabCountDisplay.textContent = `Showing ${filteredCount} of ${totalTabs} Tabs`;

        // Clear existing tab list
        tabList.innerHTML = "";

        // Get the active tab
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (activeTabs) {
            const activeTab = activeTabs[0];
            const activeTabIndex =
              filteredTabs.findIndex((tab) => tab.id === activeTab.id) + 1; // +1 for 1-based index

            // Update display with active tab index
            tabCountDisplay.textContent = `Tab: ${
              activeTabIndex > 0 ? activeTabIndex : 0
            } of ${totalTabs}`;

            filteredTabs.forEach(function (tab) {
              const li = document.createElement("li");
              li.style.display = "flex";
              li.style.justifyContent = "space-between";
              li.style.alignItems = "center";
              li.style.overflow = "hidden"; // To ensure the ellipsis works

              // Highlight the active tab
              if (tab.id === activeTab.id) {
                li.classList.add("active-tab");
              }

              // Create an img element for the favicon
              const faviconImg = document.createElement("img");
              faviconImg.style.width = "13px";
              faviconImg.style.height = "13px";
              faviconImg.style.marginRight = "5px";
              faviconImg.style.paddingTop = "2px";
              faviconImg.src = tab.favIconUrl || "default-favicon-url.ico"; // Fallback URL if no favicon found

              // Create a span for the tab title and URL
              const titleSpan = document.createElement("span");
              titleSpan.textContent = `${tab.title} - ${tab.url}`;
              titleSpan.style.flex = "1"; // Allow title span to grow
              titleSpan.style.whiteSpace = "nowrap"; // Prevent line breaks
              titleSpan.style.overflow = "hidden"; // Hide overflow
              titleSpan.style.textOverflow = "ellipsis"; // Show ellipsis when truncated

              // Create close icon
              const closeIcon = document.createElement("span");
              closeIcon.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1.5 1.5a.5.5 0 0 1 .708 0L8 7.293 14.793 1.5a.5.5 0 0 1 .707.707L8.707 8l6.793 6.793a.5.5 0 0 1-.707.707L8 8.707l-6.793 6.793a.5.5 0 0 1-.707-.707L7.293 8 1.5 1.207a.5.5 0 0 1 0-.707z"/>
                      </svg>
                    `;
              closeIcon.style.cursor = "pointer";
              closeIcon.style.marginLeft = "10px";

              // Add click event to close the tab
              closeIcon.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent triggering the li click event
                chrome.tabs.remove(tab.id, () => {
                  renderTabs(searchInput.value); // Re-render tabs after closing
                });
              });

              // Append elements to the li
              li.appendChild(faviconImg);
              li.appendChild(titleSpan);
              li.appendChild(closeIcon);

              // Add a click event to open the tab
              li.addEventListener("click", function () {
                chrome.tabs.update(tab.id, { active: true });
              });

              tabList.appendChild(li);
            });

            document.querySelectorAll("#tab-list li").forEach((li) => {
              li.addEventListener("mouseenter", () => {
                li.querySelector("span").style.whiteSpace = "normal";
                li.querySelector("span").style.overflow = "visible";
                li.querySelector("span").style.textOverflow = "unset";
              });

              li.addEventListener("mouseleave", () => {
                li.querySelector("span").style.whiteSpace = "nowrap";
                li.querySelector("span").style.overflow = "hidden";
                li.querySelector("span").style.textOverflow = "ellipsis";
              });
            });
          }
        );
      });
    });
  }

  // Initial rendering of tabs
  renderTabs();

  // Search input event listener
  searchInput.addEventListener("input", function () {
    renderTabs(searchInput.value);
  });

  // Initialize theme mode
  themeMode();
  document.body.classList.toggle(
    "dark",
    localStorage.getItem("tab_viewer_theme") === "dark"
  );

  // Toggle button event listener
  toggleButton.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "tab_viewer_theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });
});
