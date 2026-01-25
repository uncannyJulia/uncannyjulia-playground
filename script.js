// loading and declaring variables
const icons = ["icons/kitty.png", "icons/bunny.png", "icons/dog.png", "icons/about.png", "icons/contact.png", "icons/folder.png"]; // Replace with your actual icons
const klick = new Audio('icons/klick.mp3');

// Initialize markdown parser
const markdownParser = new MarkdownParser();

// Blog posts registry (used for both window list and subpage)
const BLOG_POSTS = [
    {
        id: 'intell',
        title: 'The Intelligence Discourse: Some Problematic Baggage',
        date: '2026-01-25',
        file: 'blog/intell.md'
    },
    {
        id: 'alignment',
        title: 'The AI Alignment Problem: A Smokescreen',
        date: '2026-01-24',
        file: 'blog/alignment.md'
    }
];

// Check for blog post URL parameter and show subpage if present
function checkBlogSubpage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');

    if (postId) {
        const post = BLOG_POSTS.find(p => p.id === postId);
        if (post) {
            showBlogSubpage(post);
            return true;
        }
    }
    return false;
}

// Show blog post as full subpage
function showBlogSubpage(post) {
    const subpage = document.getElementById('blog-subpage');
    const content = document.getElementById('blog-content');

    if (subpage && content) {
        // Hide desktop elements
        document.getElementById('icons-container').style.display = 'none';
        document.getElementById('taskbar').style.display = 'none';
        document.querySelector('.bg-image').style.display = 'none';

        // Load and show blog content
        content.innerHTML = '<p>Loading...</p>';
        subpage.style.display = 'block';

        markdownParser.parseFile(post.file).then(htmlContent => {
            content.innerHTML = htmlContent;
        }).catch(error => {
            console.error('Error loading blog post:', error);
            content.innerHTML = '<p>Error loading article.</p>';
        });
    }
}

const date = new Date()
const options = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};

let zIndex = 1000;
let windows = [];
let activeWindow = null;

// instantiate the taskbar and the clock
document.addEventListener('DOMContentLoaded', function() {
    // Check if we should show a blog subpage instead of the desktop
    if (checkBlogSubpage()) {
        return; // Don't initialize desktop if showing blog subpage
    }

    // Check if taskbar exists, create it if it doesn't
    if (!document.getElementById('taskbar')) {
        const taskbar = document.createElement('div');
        taskbar.id = 'taskbar';
        document.body.appendChild(taskbar);
    } else {
        // Clear existing taskbar if it exists
        const taskbar = document.getElementById('taskbar');
        taskbar.innerHTML = '';
    }

    // Create left container for window items
    const leftContainer = document.createElement('div');
    leftContainer.id = 'taskbar-left';
    leftContainer.className = 'taskbar-left';

    // Create clock element
    const timeElement = document.createElement('div');
    timeElement.id = 'taskbar-time';
    timeElement.className = 'taskbar-time';

    // Add both to taskbar
    const taskbar = document.getElementById('taskbar');
    taskbar.appendChild(leftContainer);
    taskbar.appendChild(timeElement);

    // Start the clock
    updateClock();
    setInterval(updateClock, 1000);
});

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    document.getElementById('taskbar-time').textContent = timeString;
}

// Function to create a draggable element
function createDraggableElement(iconName, index) {
    // Create main container
    const dragElement = document.createElement("div");
    dragElement.className = "drag-element";
    dragElement.id = `drag-element-${index}`;

    // Set position with some offset between elements
    dragElement.style.top = `${10 + (index * 100)}px`;
    dragElement.style.left = `${10 + (index)}px`;

    // Create image container
    const imageDiv = document.createElement("div");
    imageDiv.className = "drag-element-image";
    imageDiv.id = `drag-element-image-${index}`;
    imageDiv.style.backgroundImage = `url(${iconName})`;

    // Create text container
    const textDiv = document.createElement("div");
    textDiv.className = "drag-element-text";
    textDiv.id = `drag-element-text-${index}`;

    // Create text content
    const textContent = document.createElement("p");
    // Extract name without extension and folder path for the label
    const fileName = iconName.split('/').pop(); // Remove folder path
    const label = fileName.split('.')[0]; // Remove file extension
    // Display name mapping for icons
    const displayNames = {
        'folder': 'projects',
        'dog': 'blog',
        'bunny': 'bunny-book'
    };
    textContent.textContent = displayNames[label] || label;

    // Assemble the elements
    textDiv.appendChild(textContent);
    dragElement.appendChild(imageDiv);
    dragElement.appendChild(textDiv);

    // Add to icons container
    const container = document.getElementById('icons-container') || document.body;
    container.appendChild(dragElement);

    // Add drag functionality
    makeDraggable(dragElement);

    // Add click functionality to open a window
    dragElement.addEventListener("dblclick", function (e) {
        // Prevent click from triggering immediately during drag operations
        if (!this.isDragging) {
            // Get the label for the window title
            const label = this.querySelector('.drag-element-text p').textContent;

            // Create/open window with the icon's name as title
            if (label === 'about') {
                createWindow('About', '', '#8d95e7', 600, 500, null, false, 'content/vita.md');
            } else if (label === 'contact') {
                createContactWindow();
            } else if (label === 'kitty') {
                createKittyGalleryWindow();
            } else if (label === 'bunny' || label === 'bunny-book') {
                createGuestbookWindow();
            } else if (label === 'folder' || label === 'projects') {
                createProjectsWindow();
            } else if (label === 'dog' || label === 'blog') {
                createBlogWindow();
            } else {
                createWindow(label, `This is the ${label} application window`);
            }
        }
        // Reset the dragging flag
        this.isDragging = false;
    });
}

// This function handles both mouse and touch dragging for icons
function makeDraggable(element) {
    let initX, initY, firstX, firstY;
    let hasMoved = false;

    // MOUSE EVENTS
    element.addEventListener("mousedown", function(e) {
        e.preventDefault();

        initX = this.offsetLeft;
        initY = this.offsetTop;
        firstX = e.pageX;
        firstY = e.pageY;
        hasMoved = false;

        const moveHandler = function(e) {
            element.style.left = (initX + (e.pageX - firstX)) + "px";
            element.style.top = (initY + (e.pageY - firstY)) + "px";

            // If we moved more than a few pixels, consider it a drag rather than a click
            if (Math.abs(e.pageX - firstX) > 5 || Math.abs(e.pageY - firstY) > 5) {
                element.isDragging = true;
                hasMoved = true;
            }
        };

        document.addEventListener("mousemove", moveHandler);

        document.addEventListener("mouseup", function() {
            document.removeEventListener("mousemove", moveHandler);
            // Only mark as dragging if actually moved
            if (!hasMoved) {
                element.isDragging = false;
            }
        }, {once: true});
    });

    // TOUCH EVENTS
    let touchStartTime;

    element.addEventListener("touchstart", function(e) {
        const touch = e.touches[0];

        touchStartTime = new Date().getTime();

        initX = this.offsetLeft;
        initY = this.offsetTop;
        firstX = touch.pageX;
        firstY = touch.pageY;
        hasMoved = false;

        const touchMoveHandler = function(e) {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            element.style.left = (initX + (touch.pageX - firstX)) + "px";
            element.style.top = (initY + (touch.pageY - firstY)) + "px";

            // If we moved more than a few pixels, consider it a drag rather than a tap
            if (Math.abs(touch.pageX - firstX) > 10 || Math.abs(touch.pageY - firstY) > 10) {
                element.isDragging = true;
                hasMoved = true;
            }
        };

        const touchEndHandler = function() {
            document.removeEventListener("touchmove", touchMoveHandler);

            // Check if this was a quick tap (for double-tap detection)
            const touchEndTime = new Date().getTime();

            // Only mark as dragging if actually moved
            if (!hasMoved) {
                element.isDragging = false;

                // Detect double-tap (within 300ms of last tap)
                if (element.lastTapTime && (touchEndTime - element.lastTapTime) < 300) {
                    // Double-tap detected - open window
                    const label = element.querySelector('.drag-element-text p').textContent;
                    if (label === 'about') {
                        createWindow('About', '', '#8d95e7', 600, 500, null, false, 'content/vita.md');
                    } else if (label === 'contact') {
                        createContactWindow();
                    } else if (label === 'kitty') {
                        createKittyGalleryWindow();
                    } else if (label === 'bunny' || label === 'bunny-book') {
                        createGuestbookWindow();
                    } else if (label === 'folder' || label === 'projects') {
                        createProjectsWindow();
                    } else if (label === 'dog' || label === 'blog') {
                        createBlogWindow();
                    } else {
                        createWindow(label, `This is the ${label} application window`);
                    }
                }

                // Store the last tap time for double-tap detection
                element.lastTapTime = touchEndTime;
            }

            document.removeEventListener("touchend", touchEndHandler);
        };

        document.addEventListener("touchmove", touchMoveHandler);
        document.addEventListener("touchend", touchEndHandler);
    });
}

// Create an element for each icon
icons.forEach((icon, index) => {
    createDraggableElement(icon, index);
});

// make a sound when the page loads with the first message
setTimeout(() => {
    klick.play().catch(e => console.log('Audio autoplay blocked:', e));
    const welcomeContent = `Welcome to my little corner of the internet!

This is a playground and tribute to my childhood filled with anime and computer games. It's forever work in progress.

The internet has become so bland and corporate - I miss the days when everyone had weird personal websites. So here's mine.

Double-click the icons to explore. Check out the life graph, leave something in the guestbook, or just poke around.

Icons are Kawaii Lineal color from freepik.com. Sounds from FoxBoyTails and freesound_community on Pixabay.`;

    const firstWindow = createWindow("Welcome", welcomeContent, '#8d95e7', 400, 600, null, true);
}, 1000);


setTimeout(() => {
    klick.play().catch(e => console.log('Audio autoplay blocked:', e));
    const graphWindow = createWindow("Graph", "", '#8d95e7', 800, 600, "graph_page.html");
    // Position it to the right and move it behind Welcome
    graphWindow.style.left = '350px';
    graphWindow.style.top = '80px';
    graphWindow.style.zIndex = zIndex - 5;
}, 500);

function createWindow(title, content, headerColor = '#8d95e7', initWidth = 400, initHeight = 300, url = null, isMarkdown = false, markdownFile = null) {
    const existingWindow = windows.find(w => w.title === title);
    if (existingWindow) {
        // If window exists but is minimized, restore it
        if (existingWindow.minimized) {
            restoreWindow(existingWindow.element);
        }
        // Set it as active window (bring to front)
        setActiveWindow(existingWindow.element);
        return existingWindow.element;
    }

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    // If no existing window, continue with creating a new one
    const windowId = 'window-' + Date.now();
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = windowId;
    windowEl.style.zIndex = zIndex++;

    if (isMobile) {
        // On mobile: stack windows, full width
        const windowCount = windows.length;
        windowEl.style.top = (10 + windowCount * 50) + 'px';
        windowEl.style.left = '10px';
        windowEl.style.width = 'calc(100vw - 20px)';
        windowEl.style.height = Math.min(initHeight, window.innerHeight * 0.6) + 'px';
    } else {
        // On desktop: random position
        windowEl.style.top = (50 + Math.random() * 100) + 'px';
        windowEl.style.left = (50 + Math.random() * 100) + 'px';
        windowEl.style.width = `${initWidth}px`;
        windowEl.style.height = `${initHeight}px`;
    }

    // Create window header
    const header = document.createElement('div');
    header.className = 'window-header';
    header.style.backgroundColor = headerColor;

    const windowTitle = document.createElement('h3');
    windowTitle.className = 'window-title';
    windowTitle.textContent = title;

    const controls = document.createElement('div');
    controls.className = 'window-controls';

    const minimizeBtn = document.createElement('div');
    minimizeBtn.className = 'window-control window-minimize';
    minimizeBtn.title = 'Minimize';
    minimizeBtn.innerHTML = '&minus;';

    const maximizeBtn = document.createElement('div');
    maximizeBtn.className = 'window-control window-maximize';
    maximizeBtn.title = 'Maximize';
    maximizeBtn.innerHTML = '&plus;';

    const closeBtn = document.createElement('div');
    closeBtn.className = 'window-control window-close';
    closeBtn.title = 'Close';
    closeBtn.innerHTML = '&times;';

    controls.appendChild(minimizeBtn);
    controls.appendChild(maximizeBtn);
    controls.appendChild(closeBtn);

    header.appendChild(windowTitle);
    header.appendChild(controls);

    // Create window content
    const windowContent = document.createElement('div');
    windowContent.className = 'window-content';

    if (url) {
        // Create an iframe to display the external content
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none'; // Remove iframe border
        windowContent.appendChild(iframe);
    } else if (markdownFile) {
        // Load markdown file and parse it
        windowContent.innerHTML = '<p>Loading...</p>';
        windowContent.classList.add('markdown-content');
        
        markdownParser.parseFile(markdownFile).then(htmlContent => {
            windowContent.innerHTML = htmlContent;
        }).catch(error => {
            console.error('Error loading markdown file:', error);
            windowContent.innerHTML = '<p>Error loading markdown file</p>';
        });
    } else if (isMarkdown && typeof content === 'string') {
        // Parse markdown content
        const htmlContent = markdownParser.parse(content);
        windowContent.innerHTML = htmlContent;
        windowContent.classList.add('markdown-content');
    } else if (typeof content === 'string') {
        windowContent.innerHTML = content;
    } else {
        windowContent.appendChild(content);
    }


    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'window-resize-handle';

    // Assemble window
    windowEl.appendChild(header);
    windowEl.appendChild(windowContent);
    windowEl.appendChild(resizeHandle);

    document.body.appendChild(windowEl);

    // Add to taskbar
    addToTaskbar(windowId, title);

    // Add to windows array
    windows.push({
        id: windowId,
        title: title,
        element: windowEl,
        minimized: false,
        maximized: false
    });

    // Set as active window
    setActiveWindow(windowEl);

    // Set up event listeners
    setupDragging(windowEl, header);
    setupResizing(windowEl, resizeHandle);

    // Control buttons events
    minimizeBtn.addEventListener('click', () => {
        minimizeWindow(windowEl);
    });

    maximizeBtn.addEventListener('click', () => {
        maximizeWindow(windowEl);
    });

    closeBtn.addEventListener('click', () => {
        closeWindow(windowEl);
    });

    // Click on window to bring to front
    windowEl.addEventListener('mousedown', () => {
        setActiveWindow(windowEl);
    });

    setupWindowTouchEvents(windowEl);
    return windowEl;
}

// Add window to taskbar
function addToTaskbar(windowId, title) {
    const leftContainer = document.getElementById('taskbar-left');
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.textContent = title;
    taskbarItem.setAttribute('data-window', windowId);

    taskbarItem.addEventListener('click', () => {
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            const windowObj = windows.find(w => w.id === windowId);
            if (windowObj && windowObj.minimized) {
                restoreWindow(windowElement);
            } else {
                setActiveWindow(windowElement);
            }
        }
    });

    // Add to the items container (not directly to taskbar)
    leftContainer.appendChild(taskbarItem);
}

// Handle all the window events
function setActiveWindow(windowElement) {
    if (activeWindow) {
        activeWindow.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    }

    windowElement.style.zIndex = zIndex++;
    windowElement.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
    activeWindow = windowElement;
}

// Minimize window
function minimizeWindow(windowElement) {
    const windowObj = windows.find(w => w.id === windowElement.id);
    if (windowObj) {
        windowObj.minimized = true;
        windowObj.maximized = false;
        windowElement.classList.add('minimized');
        windowElement.classList.remove('maximized');

        // Actually hide the window
        windowElement.style.display = 'none';

        // Highlight the taskbar item to show it's minimized
        const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowElement.id}"]`);
        if (taskbarItem) {
            taskbarItem.classList.add('minimized');
        }
    }
}
// Maximize window
function maximizeWindow(windowElement) {
    const windowObj = windows.find(w => w.id === windowElement.id);
    if (windowObj) {
        if (windowObj.maximized) {
            // Restore to original size and position
            windowObj.maximized = false;
            windowElement.classList.remove('maximized');
            // Restore original dimensions if they were saved
            if (windowObj.originalDimensions) {
                windowElement.style.width = windowObj.originalDimensions.width;
                windowElement.style.height = windowObj.originalDimensions.height;
                windowElement.style.top = windowObj.originalDimensions.top;
                windowElement.style.left = windowObj.originalDimensions.left;
            }
        } else {
            // Save current dimensions before maximizing
            windowObj.originalDimensions = {
                width: windowElement.style.width,
                height: windowElement.style.height,
                top: windowElement.style.top,
                left: windowElement.style.left
            };

            // Maximize - calculate available space
            const taskbarHeight = document.getElementById('taskbar').offsetHeight;

            // Set to fill available space minus taskbar
            windowElement.style.width = '100%';
            windowElement.style.height = `calc(100vh - ${taskbarHeight}px)`;
            windowElement.style.top = '0';
            windowElement.style.left = '0';

            windowObj.minimized = false;
            windowObj.maximized = true;
            windowElement.classList.remove('minimized');
            windowElement.classList.add('maximized');
        }
    }
}
// Restore window from minimized state
function restoreWindow(windowElement) {
    const windowObj = windows.find(w => w.id === windowElement.id);
    if (windowObj) {
        windowObj.minimized = false;
        windowElement.classList.remove('minimized');

        // Make window visible again
        windowElement.style.display = 'block';

        // Remove highlight from taskbar item
        const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowElement.id}"]`);
        if (taskbarItem) {
            taskbarItem.classList.remove('minimized');
        }

        setActiveWindow(windowElement);
    }
}

// Close window
function closeWindow(windowElement) {
    // Remove from taskbar
    const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowElement.id}"]`);
    if (taskbarItem) {
        taskbarItem.remove();
    }

    // Remove from windows array
    const index = windows.findIndex(w => w.id === windowElement.id);
    if (index !== -1) {
        windows.splice(index, 1);
    }

    // Remove from DOM
    windowElement.remove();
}

// Setup window dragging function that maintains both mouse and touch events
function setupDragging(windowElement, headerElement) {
    let offsetX, offsetY;

    // MOUSE EVENTS
    const onMouseDown = (e) => {
        // Ignore if maximized
        const windowObj = windows.find(w => w.id === windowElement.id);
        if (windowObj && windowObj.maximized) {
            return;
        }

        offsetX = e.clientX - windowElement.getBoundingClientRect().left;
        offsetY = e.clientY - windowElement.getBoundingClientRect().top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Set as active window
        setActiveWindow(windowElement);
    };

    const onMouseMove = (e) => {
        windowElement.style.left = (e.clientX - offsetX) + 'px';
        windowElement.style.top = (e.clientY - offsetY) + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    headerElement.addEventListener('mousedown', onMouseDown);

    // TOUCH EVENTS
    const onTouchStart = (e) => {
        // Ignore if maximized
        const windowObj = windows.find(w => w.id === windowElement.id);
        if (windowObj && windowObj.maximized) {
            return;
        }

        const touch = e.touches[0];
        offsetX = touch.clientX - windowElement.getBoundingClientRect().left;
        offsetY = touch.clientY - windowElement.getBoundingClientRect().top;

        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);

        // Set as active window
        setActiveWindow(windowElement);
    };

    const onTouchMove = (e) => {
        e.preventDefault(); // Prevent scrolling when dragging
        const touch = e.touches[0];
        windowElement.style.left = (touch.clientX - offsetX) + 'px';
        windowElement.style.top = (touch.clientY - offsetY) + 'px';
    };

    const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    };

    headerElement.addEventListener('touchstart', onTouchStart);
}

// Setup window resizing with both mouse and touch events
function setupResizing(windowElement, resizeHandle) {
    // MOUSE EVENTS
    let startX, startY, startWidth, startHeight;

    const onMouseDown = (e) => {
        // Ignore if maximized
        const windowObj = windows.find(w => w.id === windowElement.id);
        if (windowObj && windowObj.maximized) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(windowElement).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(windowElement).height, 10);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Set as active window
        setActiveWindow(windowElement);
    };

    const onMouseMove = (e) => {
        const newWidth = startWidth + e.clientX - startX;
        const newHeight = startHeight + e.clientY - startY;

        if (newWidth > 200) {
            windowElement.style.width = newWidth + 'px';
        }

        if (newHeight > 150) {
            windowElement.style.height = newHeight + 'px';
        }
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    resizeHandle.addEventListener('mousedown', onMouseDown);

    // TOUCH EVENTS
    const onTouchStart = (e) => {
        // Ignore if maximized
        const windowObj = windows.find(w => w.id === windowElement.id);
        if (windowObj && windowObj.maximized) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(windowElement).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(windowElement).height, 10);

        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);

        // Set as active window
        setActiveWindow(windowElement);
    };

    const onTouchMove = (e) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const newWidth = startWidth + touch.clientX - startX;
        const newHeight = startHeight + touch.clientY - startY;

        if (newWidth > 200) {
            windowElement.style.width = newWidth + 'px';
        }

        if (newHeight > 150) {
            windowElement.style.height = newHeight + 'px';
        }
    };

    const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    };

    resizeHandle.addEventListener('touchstart', onTouchStart);
}

// Setup touch events for window controls
function setupWindowTouchEvents(windowElement) {
    const minimizeBtn = windowElement.querySelector('.window-minimize');
    const maximizeBtn = windowElement.querySelector('.window-maximize');
    const closeBtn = windowElement.querySelector('.window-close');

    minimizeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        minimizeWindow(windowElement);
    });

    maximizeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        maximizeWindow(windowElement);
    });

    closeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeWindow(windowElement);
    });

    // Add touchstart for activating window
    windowElement.addEventListener('touchstart', () => {
        setActiveWindow(windowElement);
    });
}

// Create contact window with social media links and email composer
function createContactWindow() {
    const contactContent = `I'm not on social media, but you can find me here:

<div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin: 25px 0;">
    <div style="text-align: center;">
        <a href="https://github.com/uncannyjulia" target="_blank" style="text-decoration: none; color: inherit;">
            <img src="icons/github.png" alt="GitHub" style="width: 48px; height: 48px; margin-bottom: 8px;">
            <div>GitHub</div>
        </a>
    </div>
    <div style="text-align: center;">
        <a href="https://www.researchgate.net/profile/Julia-Thomas-24?ev=hdr_xprf" target="_blank" style="text-decoration: none; color: inherit;">
            <img src="icons/research.png" alt="ResearchGate" style="width: 48px; height: 48px; margin-bottom: 8px;">
            <div>ResearchGate</div>
        </a>
    </div>
    <div style="text-align: center;">
        <a href="https://www.linkedin.com/in/julia-thomas-a5ba27214/" target="_blank" style="text-decoration: none; color: inherit;">
            <img src="icons/linkedin.png" alt="LinkedIn" style="width: 48px; height: 48px; margin-bottom: 8px;">
            <div>LinkedIn</div>
        </a>
    </div>
</div>

Or send me a message directly:

<div style="text-align: center; margin: 20px 0;">
    <div style="cursor: pointer; display: inline-block;" onclick="openEmailComposer()">
        <img src="icons/email.png" alt="Email" style="width: 48px; height: 48px; margin-bottom: 8px;">
        <div>Send Email</div>
    </div>
</div>`;

    createWindow('Contact', contactContent, '#e78db5', 400, 400, null, true);
}

// Create email composer window
function openEmailComposer() {
    const emailContent = document.createElement('div');
    emailContent.style.padding = '20px';
    emailContent.innerHTML = `
        <div id="emailStatus" style="margin-bottom: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
        <form id="emailForm" style="display: flex; flex-direction: column; gap: 15px;">
            <div>
                <label for="senderName" style="display: block; margin-bottom: 5px;">Name</label>
                <input type="text" id="senderName" name="senderName" required
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
            </div>
            <div>
                <label for="senderEmail" style="display: block; margin-bottom: 5px;">Email</label>
                <input type="email" id="senderEmail" name="senderEmail" required
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                <div id="emailError" style="color: #d32f2f; font-size: 12px; margin-top: 5px; display: none;">
                    Invalid email
                </div>
            </div>
            <div>
                <label for="subject" style="display: block; margin-bottom: 5px;">Subject</label>
                <input type="text" id="subject" name="subject" required
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
            </div>
            <div>
                <label for="message" style="display: block; margin-bottom: 5px;">Message</label>
                <textarea id="message" name="message" required rows="5"
                          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; resize: vertical;"></textarea>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" onclick="closeEmailComposer()"
                        style="padding: 10px 20px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 4px; cursor: pointer;">
                    Cancel
                </button>
                <button type="submit" id="sendButton"
                        style="padding: 10px 20px; border: none; background: #4CAF50; color: white; border-radius: 4px; cursor: pointer;">
                    Send
                </button>
            </div>
        </form>
    `;

    const emailWindow = createWindow('Email', emailContent, '#4CAF50', 380, 450);
    
    // Add form submission handler
    const form = emailContent.querySelector('#emailForm');
    const statusDiv = emailContent.querySelector('#emailStatus');
    const emailError = emailContent.querySelector('#emailError');
    const sendButton = emailContent.querySelector('#sendButton');
    const emailInput = emailContent.querySelector('#senderEmail');
    
    // Email validation
    emailInput.addEventListener('input', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            emailError.style.display = 'block';
            this.style.borderColor = '#d32f2f';
        } else {
            emailError.style.display = 'none';
            this.style.borderColor = '#ddd';
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const name = formData.get('senderName');
        const email = formData.get('senderEmail');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showStatus('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';
        sendButton.style.background = '#ccc';
        
        // Send email using EmailJS
        sendEmailViaEmailJS(name, email, subject, message)
            .then(response => {
                if (response.ok) {
                    showStatus('Email sent successfully! Thank you for your message.', 'success');
                    form.reset();
                    setTimeout(() => {
                        closeEmailComposer();
                    }, 2000);
                } else {
                    throw new Error('Failed to send email');
                }
            })
            .catch(error => {
                console.error('Error sending email:', error);
                showStatus('Sorry, there was an error sending your email. Please try again or contact julia@xemantic.com directly.', 'error');
            })
            .finally(() => {
                sendButton.disabled = false;
                sendButton.textContent = 'Send Email';
                sendButton.style.background = '#4CAF50';
            });
    });
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        statusDiv.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
        statusDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        statusDiv.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    }
}

// Function to send email via EmailJS
async function sendEmailViaEmailJS(name, email, subject, message) {
    // EmailJS configuration - replace with your actual values
    const serviceID = 'YOUR_SERVICE_ID'; // e.g., 'service_abc123'
    const templateID = 'YOUR_TEMPLATE_ID'; // e.g., 'template_xyz789'
    const publicKey = 'YOUR_PUBLIC_KEY'; // e.g., 'user_abcdef123456'
    
    const templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
        to_email: 'julia@xemantic.com'
    };
    
    try {
        // Initialize EmailJS if not already done
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded');
        }
        
        // Send email
        const response = await emailjs.send(serviceID, templateID, templateParams, publicKey);
        
        return { ok: true, response };
    } catch (error) {
        console.error('Error sending email via EmailJS:', error);
        throw error;
    }
}

// Close email composer window
function closeEmailComposer() {
    const emailWindow = windows.find(w => w.title === 'Email');
    if (emailWindow) {
        closeWindow(emailWindow.element);
    }
}

// Create Kitty Gallery window with cat video
function createKittyGalleryWindow() {
    const kittyContent = `My cat:

<div style="text-align: center; margin: 20px 0;">
    <video width="100%" controls style="max-width: 480px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <source src="content/MicrosoftTeams-video.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
</div>`;

    createWindow('Kitty', kittyContent, '#f5a6c9', 520, 420, null, true);
}

// Create Guestbook window
function createGuestbookWindow() {
    const guestbookContent = document.createElement('div');
    guestbookContent.style.padding = '15px';
    guestbookContent.innerHTML = `
        <p style="color: #666; margin-top: 0;">Remember guestbooks? Leave a message.</p>

        <div id="guestbookEntries" style="max-height: 180px; overflow-y: auto; margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 8px;">
            <div style="padding: 10px; border-bottom: 1px dashed #ddd;">
                <strong>WebSurfer2000</strong> <span style="color: #999; font-size: 12px;">- Jan 2026</span>
                <p style="margin: 5px 0 0 0;">Cool site! Takes me back to the old internet days.</p>
            </div>
            <div style="padding: 10px;">
                <strong>Anonymous</strong> <span style="color: #999; font-size: 12px;">- Jan 2026</span>
                <p style="margin: 5px 0 0 0;">Love the retro vibes. More sites should be like this.</p>
            </div>
        </div>

        <form id="guestbookForm" style="display: flex; flex-direction: column; gap: 10px;">
            <input type="text" id="guestName" placeholder="Name (optional)"
                   style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <textarea id="guestMessage" placeholder="Your message" rows="3" required
                      style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
            <button type="submit" style="padding: 10px; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Sign
            </button>
        </form>
        <p style="font-size: 11px; color: #999; margin-top: 10px;">
            Frontend-only for now, messages won't persist.
        </p>
    `;

    const guestbookWindow = createWindow('Guestbook', guestbookContent, '#9b59b6', 450, 550);

    // Add form handler
    const form = guestbookContent.querySelector('#guestbookForm');
    const entries = guestbookContent.querySelector('#guestbookEntries');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('guestName').value || 'Anonymous Visitor';
        const message = document.getElementById('guestMessage').value;

        if (message.trim()) {
            const newEntry = document.createElement('div');
            newEntry.style.cssText = 'padding: 10px; border-bottom: 1px dashed #ddd; animation: fadeIn 0.3s;';
            newEntry.innerHTML = `
                <strong>${name}</strong> <span style="color: #999; font-size: 12px;">- Just now</span>
                <p style="margin: 5px 0 0 0;">${message}</p>
            `;
            entries.insertBefore(newEntry, entries.firstChild);

            form.reset();
        }
    });
}

// Create Blog window with list of posts
function createBlogWindow() {
    const blogContent = document.createElement('div');
    blogContent.style.padding = '15px';

    blogContent.innerHTML = `
        <p style="color: #666; margin-top: 0; margin-bottom: 15px;">Thoughts and writings.</p>
        <div class="blog-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${BLOG_POSTS.map(post => `
                <div class="blog-item" data-id="${post.id}" data-file="${post.file}" data-title="${post.title}" style="
                    padding: 12px;
                    background: rgba(141, 149, 231, 0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                " onmouseover="this.style.background='rgba(141, 149, 231, 0.25)'" onmouseout="this.style.background='rgba(141, 149, 231, 0.1)'">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${post.title}</div>
                        <a href="?post=${post.id}" class="expand-link" onclick="event.stopPropagation();">↗ expand</a>
                    </div>
                    <div style="font-size: 12px; color: #888;">${post.date}</div>
                </div>
            `).join('')}
        </div>
    `;

    const blogWindow = createWindow('Blog', blogContent, '#e67e22', 450, 350);

    // Add click handlers for blog posts (opens in window)
    blogContent.querySelectorAll('.blog-item').forEach(item => {
        item.addEventListener('click', () => {
            const file = item.getAttribute('data-file');
            const title = item.getAttribute('data-title');
            createWindow(title, '', '#e67e22', 600, 500, null, false, file);
        });
    });
}

// Create Projects folder window with clickable project icons
function createProjectsWindow() {
    const projectsContent = document.createElement('div');
    projectsContent.style.cssText = 'padding: 10px;';

    const projects = [
        {
            id: 'rulemapping',
            icon: 'icons/layers.png',
            name: 'Rulemapping'
        },
        {
            id: 'krisenchat',
            icon: 'icons/touch.png',
            name: 'Krisenchat'
        },
        {
            id: 'xemantic',
            icon: 'icons/phi.png',
            name: 'Xemantic'
        },
        {
            id: 'publications',
            icon: 'icons/microscope.png',
            name: 'Publications'
        },
        {
            id: 'phd',
            icon: 'icons/diploma.png',
            name: 'PhD Research'
        },
        {
            id: 'freelance',
            icon: 'icons/freelancer.png',
            name: 'Freelance'
        }
    ];

    projectsContent.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 15px; padding: 5px;">
            ${projects.map(p => `
                <div class="project-icon" data-project="${p.id}" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px 5px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                    background: rgba(141, 149, 231, 0.1);
                " onmouseover="this.style.background='rgba(141, 149, 231, 0.25)'" onmouseout="this.style.background='rgba(141, 149, 231, 0.1)'">
                    <img src="${p.icon}" alt="${p.name}" style="
                        width: 50px;
                        height: 50px;
                        margin-bottom: 8px;
                    ">
                    <span style="color: #333; font-size: 11px; text-align: center; word-wrap: break-word; max-width: 70px;">${p.name}</span>
                </div>
            `).join('')}
        </div>
    `;

    const projectWindow = createWindow('Projects', projectsContent, '#8d95e7', 380, 320);

    // Add click handlers for each project icon
    projectsContent.querySelectorAll('.project-icon').forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const projectId = icon.getAttribute('data-project');
            openProjectDetail(projectId);
        });
    });
}

// Open individual project detail windows
function openProjectDetail(projectId) {
    const projectDetails = {
        rulemapping: {
            title: 'Rulemapping Group',
            color: '#1abc9c',
            content: `Since September 2025 I work as Senior AI & Data Expert at Rulemapping Group, bringing my experience in ML engineering and data architecture to drive data-driven decision making and AI implementations.`
        },
        krisenchat: {
            title: 'Krisenchat',
            color: '#e74c3c',
            content: `Krisenchat is Germany's 24/7 crisis counseling service for young people via chat. I worked there for over four years in various roles.

I started in 2021 as a researcher - evaluations, dashboards, data architecture. In 2022 I moved to the tech team as Machine Learning Engineer. There I built the MLOps infrastructure and developed various ML models: a transformer for capacity planning, sentence transformers for risk monitoring, Graph Neural Networks for complex risk analysis, and later agentic LLM applications for counseling support.

In 2025 I became AI Solutions Architect. This role was mainly about mediating between the therapeutic requirements of counselors and technical possibilities. How do you build AI systems that support without restricting therapeutic autonomy? That was the central question.

Working at krisenchat shaped me significantly - this is where I learned what it means to develop AI for sensitive contexts.`
        },
        xemantic: {
            title: 'Xemantic',
            color: '#9b59b6',
            content: `Xemantic is an art collective I've been part of since 2021. Our motto: Applied philosophy as code and politics.

We do generative art, performances with technology, live coding. Everything open source. A current project is anthropic-sdk-kotlin - an unofficial Kotlin variant of the Anthropic SDK.

I'm also part of Prachtsaal, a shared studio cooperative in Berlin. This community gives me daily learning opportunities and a sense of belonging.

We're selective about collaborations - we look for projects that blend applied philosophy with code.

More at xemantic.com and github.com/xemantic`
        },
        publications: {
            title: 'Publications',
            color: '#3498db',
            content: `I have 14 scientific publications, mainly in AI and mental health.

Recent work (2024-2025) deals with Large Language Models for automated suicide risk assessment - how reliable are LLM ratings compared to human experts? I also developed and validated an Explainable AI text classifier for suicidality prediction.

Earlier work (2022-2023) examined krisenchat usage patterns: Who are the frequent users? What linguistic patterns emerge? How does socioeconomic status relate to counseling success?

The first publications (2022) investigated the basic acceptability and feasibility of messenger-based crisis counseling for young people.

Over 1000 reads and 71 citations total.`
        },
        phd: {
            title: 'PhD Research',
            color: '#e67e22',
            content: `Since 2023 I'm doing my PhD at University of Basel in Clinical Psychology and Epidemiology.

My research topic: Agentic AI for autonomous diagnostic systems. How can AI agents support clinical diagnoses while remaining transparent, explainable, and ethically sound?

In parallel, I'm training as a psychotherapist at Klinik Bergfried in Saalfeld - individual and group therapy, relaxation techniques, competence training.

My background: Master's in Clinical Psychology at IPU Berlin, then a CAS in Advanced Machine Learning at University of Bern focusing on Graph Neural Networks.

The combination of clinical practice and technical research matters to me - I want to understand what therapists actually need before building tools for them.`
        },
        freelance: {
            title: 'Freelance',
            color: '#e91e63',
            content: `Besides my regular projects, I selectively take on freelance work.

My focus is on AI applications in mental health and other socially relevant contexts. I like building systems that support people rather than replace them - tools that preserve therapeutic autonomy while reducing administrative burden.

Technically I'm especially interested in graph-based systems, Explainable AI, and agentic LLM applications. "The AI said so" isn't good enough as an explanation, especially not in healthcare.

I'm picky about projects. I prefer working on things that have real impact, bridge disciplines, and treat ethics as more than a checkbox.

If interested, reach out via Contact.`
        }
    };

    const project = projectDetails[projectId];
    if (project) {
        createWindow(project.title, project.content, project.color, 550, 500, null, true);
    }
}