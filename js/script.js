document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const openWindows = document.querySelector('.open-windows');
    const desktopIcons = document.querySelector('.desktop-icons');
    const windowTemplate = document.getElementById('window-template');

    let zIndexCounter = 1; // Keep track of window stacking order

    // Clock
    function updateClock() {
        const now = new Date();

        // Get hours and minutes
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0'); // Always two digits

        // Determine AM or PM
        const amPm = hours >= 12 ? 'PM' : 'AM';

        // Format the hour for 12-hour format and remove leading zero
        const formattedHours = hours % 12 || 12; // Converts to 12-hour format

        // Create time string
        const timeString = `${formattedHours}:${minutes} ${amPm}`;

        document.getElementById('time').textContent = timeString;
    }

    // Update the clock immediately and then every minute
    updateClock();
    setInterval(updateClock, 60000); // Update every minute

    let windowCounter = 0;
    const offsetX = 200;
    const offsetY = 200;

    // --- Window Management ---
    function createWindow(appId) {
        let windowTemplateToUse;
        if (appId === 'Social Media') {
            windowTemplateToUse = document.getElementById('social-media-template');
        } else if (appId === 'Adopt a Kitty') {
            windowTemplateToUse = document.getElementById('adopt-kitty-template');
        } else {
            windowTemplateToUse = document.getElementById('window-template');
        }

        const windowClone = windowTemplateToUse.content.cloneNode(true);
        const windowElement = windowClone.querySelector('.window');
        windowElement.dataset.app = appId;

        const header = windowElement.querySelector('.title-bar-text');
        const content = windowElement.querySelector('.window-body');
        const closeButton = windowElement.querySelector('button[aria-label="Close"]');
        const minimizeButton = windowElement.querySelector('button[aria-label="Minimize"]');
        const maximizeButton = windowElement.querySelector('button[aria-label="Maximize"]');

        // Resize Logic (keep this part as it is)
        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('resize-handle');
        windowElement.appendChild(resizeHandle);

        const minWidth = 270;
        const minHeight = 100;

        resizeHandle.addEventListener('mousedown', (e) => { /* ... your resize event listener ... */ });

        // Set fixed initial window position
        windowElement.style.left = '150px'; // Adjust the horizontal position as needed
        windowElement.style.top = '75px';  // Adjust the vertical position as needed

        // Set window title and content based on appId
        header.textContent = appId.charAt(0).toUpperCase() + appId.slice(1);

        if (appId === 'About Me') {
            content.innerHTML = `
            <h1>About Me</h1>
            <h2>Aloha!</h2>
            <div class="window-body">
                <img src="assets/Richie_Galacgac.jpg" alt="Richie Galacgac">
                <p>My long-term goal is to be a web designer. To achieve this, I am pursuing a Bachelor of Arts degree in Creative Media with a concentration in Design and Media at the University of Hawaii West Oahu (UHWO). My interest in web design began in sixth grade when I made a joke website using Weebly. I made another website for seventh grade National History Day (NHD) and won first place in the district. I was mesmerized by the process of creating websites and meeting others’ needs. As I explored web design more, I became more intrigued and decided this was it. This is the career I dreamed of.</p>
            </div>`;
        } else if (appId === 'Projects') {
            content.innerHTML = `<h1>My Projects</h1><ul><li><strong>Project 1:</strong> <a href="https://link-to-your-project1.com" target="_blank">Description of Project 1</a></li></ul>`;
        } else if (appId === 'Contact') {
            content.innerHTML = `<h1>Contact Me</h1><form id="contact-form"><label for="name">Name:</label><input type="text" id="name" required><br><label for="email">Email:</label><input type="email" id="email" required><br><label for="message">Message:</label><input type="text" id="message" required><br><button type="submit">Send</button></form>`;
        } else if (appId === 'Resume') {
            content.innerHTML = `<h1>Resume</h1><iframe src="https://drive.google.com/file/d/1YaLLI2IhMzxEbrsRgvPpHfZCaCMLeAjj/preview" width="100%" height="600px" allow="autoplay"></iframe><a href="https://drive.google.com/file/d/1YaLLI2IhMzxEbrsRgvPpHfZCaCMLeAjj/view?usp=sharing" target="_blank"><button class="download">DOWNLOAD</button></a>`;
        }

        desktop.appendChild(windowElement);

        // Make window draggable
        windowElement.querySelector('.title-bar').addEventListener('mousedown', (e) => {
            // Prevent dragging if maximized
            if (windowElement.classList.contains('maximized')) return;

            let offsetX = e.clientX - windowElement.getBoundingClientRect().left;
            let offsetY = e.clientY - windowElement.getBoundingClientRect().top;

            activeWindow = windowElement;
            activeWindow.style.zIndex = ++zIndexCounter;

            const onMouseMove = (e) => {
                activeWindow.style.left = (e.clientX - offsetX) + 'px';
                activeWindow.style.top = (e.clientY - offsetY) + 'px';
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                activeWindow = null;
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // Close
        closeButton.addEventListener('click', () => {
            windowElement.remove();
            updateTaskbar();
        });

        // Minimize
        minimizeButton.addEventListener('click', () => {
            windowElement.style.display = 'none'; // Hide the window
            updateTaskbar(); // Update taskbar to reflect minimized state
        });

        // Maximize
        maximizeButton.addEventListener('click', () => {
            const isMaximized = windowElement.classList.toggle('maximized');
            if (isMaximized) {
                windowElement.style.position = 'fixed'; // Fix the position
                windowElement.style.top = '0'; // Snap to top
                windowElement.style.left = '0'; // Snap to left
                windowElement.style.width = '100vw'; // Full width
                windowElement.style.height = 'calc(100vh - 40px)'; // Full height minus taskbar height
            } else {
                windowElement.style.width = '300px'; // Restore default width
                windowElement.style.height = '200px'; // Restore default height
                windowElement.style.position = ''; // Reset position
            }
        });
    }

    // --- Start Menu ---
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');

    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('hidden'); // Toggle visibility of the start menu
    });

    // Handle clicks on menu items
    startMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const appId = e.target.dataset.app;
            let window = document.querySelector(`.window[data-app="${appId}"]`);
            if (!window) {
                window = createWindow(appId);
            } else {
                window.style.display = 'block'; // Restore window
                window.style.zIndex = ++zIndexCounter; // Bring to front
            }
            startMenu.classList.add('hidden'); // Close the menu after selection
            updateTaskbar(); // Update the taskbar
        }
    });

    // Close the start menu if clicking outside
    document.addEventListener('click', (e) => {
        if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.classList.add('hidden');
        }
    });

    // --- Icon Click Handling ---
    desktopIcons.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon') || e.target.parentNode.classList.contains('icon')) {
            const icon = e.target.classList.contains('icon') ? e.target : e.target.parentNode;
            const appId = icon.dataset.app;

            // Check if window is already open
            let window = document.querySelector(`.window[data-app="${appId}"]`);
            if (!window) {
                window = createWindow(appId);
            } else {
                window.style.display = 'block'; // Restore window
                window.style.zIndex = ++zIndexCounter; // Bring to front
            }
            updateTaskbar();
        }
    });

    // --- Boot Screen ---
    // script.js
    window.onload = function () {
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            // Redirect or show the main content here
            // Example: window.location.href = 'main.html';
            alert('Welcome to the site!');
        }, 5000); // Match this duration with your animation
    };

});
