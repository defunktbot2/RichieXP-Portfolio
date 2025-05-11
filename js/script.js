document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const openWindows = document.querySelector('.open-windows');
    const desktopIcons = document.querySelector('.desktop-icons');
    const windowTemplate = document.getElementById('window-template');

    let zIndexCounter = 1; // Keep track of window stacking order

    // --- Window Management ---
    function createWindow(appId) {
        const windowClone = windowTemplate.content.cloneNode(true);
        const windowElement = windowClone.querySelector('.window');
        windowElement.dataset.app = appId;

        const header = windowElement.querySelector('.title-bar-text');
        const content = windowElement.querySelector('.window-body');
        const closeButton = windowElement.querySelector('button[aria-label="Close"]');
        const minimizeButton = windowElement.querySelector('button[aria-label="Minimize"]');
        const maximizeButton = windowElement.querySelector('button[aria-label="Maximize"]');

        // Resize Logic
        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('resize-handle');
        windowElement.appendChild(resizeHandle);

        const minWidth = 270; // Set your minimum width
        const minHeight = 100; // Set your minimum height

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent text selection

            // Store initial dimensions and mouse position
            const startWidth = windowElement.offsetWidth;
            const startHeight = windowElement.offsetHeight;
            const startX = e.clientX;
            const startY = e.clientY;

            const onMouseMove = (e) => {
                // Calculate new width and height based on mouse movement
                let newWidth = startWidth + (e.clientX - startX);
                let newHeight = startHeight + (e.clientY - startY);

                // Check against minimum dimensions
                newWidth = Math.max(newWidth, minWidth);
                newHeight = Math.max(newHeight, minHeight);

                // Set new dimensions
                windowElement.style.width = `${newWidth}px`;
                windowElement.style.height = `${newHeight}px`;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // Set window title
        header.textContent = appId.charAt(0).toUpperCase() + appId.slice(1);

        // Load content based on appId
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

        // Event listeners for window controls
        closeButton.addEventListener('click', () => {
            windowElement.remove();
            updateTaskbar();
        });

        minimizeButton.addEventListener('click', () => {
            windowElement.style.display = 'none'; // Hide the window
            updateTaskbar(); // Update taskbar to reflect minimized state
        });

        maximizeButton.addEventListener('click', () => {
            windowElement.classList.toggle('maximized');
            if (windowElement.classList.contains('maximized')) {
                windowElement.style.width = '100%';
                windowElement.style.height = 'calc(100% - 40px)'; // Adjust for taskbar
            } else {
                windowElement.style.width = '300px'; // Restore default width
                windowElement.style.height = '200px'; // Restore default height
            }
        });

        desktop.appendChild(windowElement);

        // Make window draggable
        windowElement.querySelector('.title-bar').addEventListener('mousedown', (e) => {
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
    }

    // Function to update the taskbar with open windows
    function updateTaskbar() {
    const openApps = Array.from(desktop.querySelectorAll('.window'));
    openWindows.innerHTML = openApps.map(window => {
        const appId = window.dataset.app;
        const isMinimized = window.style.display === 'none';
        return `
            <span class="taskbar-icon" data-app="${appId}" style="opacity: ${isMinimized ? 0.5 : 1};">
                ${appId} 
                <div class="title-bar-controls">
                    <button aria-label="Close" class="taskbar-close"></button>
                </div>
            </span>`;
    }).join('');

    // Add click listeners to taskbar icons for restore
    document.querySelectorAll('.taskbar-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const appId = icon.dataset.app;
            const window = document.querySelector(`.window[data-app="${appId}"]`);
            if (window) {
                window.style.display = 'block'; // Restore window
                window.style.zIndex = ++zIndexCounter; // Bring to front
                updateTaskbar(); // Update taskbar
            }
        });

        // Close button logic
        const closeButton = icon.querySelector('.taskbar-close');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the icon click
                const appId = icon.dataset.app;
                const window = document.querySelector(`.window[data-app="${appId}"]`);
                if (window) {
                    window.remove(); // Close the window
                    updateTaskbar(); // Update taskbar
                }
            });
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
});