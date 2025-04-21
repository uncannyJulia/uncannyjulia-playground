// loading and declaring variables
const icons = ["kitty.png", "dog.png", "bunny.png", "about.png", "contact.png", "folder.png"]; // Replace with your actual icons
const klick = new Audio('klick.mp3');

const date = new Date()
const options = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};

let zIndex = 1000;
let windows = [];
let activeWindow = null;

// instatiate the taskbar and the clock
document.addEventListener('DOMContentLoaded', function() {
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
    // Extract name without extension for the label
    const label = iconName.split('.')[0];
    textContent.textContent = label;

    // Assemble the elements
    textDiv.appendChild(textContent);
    dragElement.appendChild(imageDiv);
    dragElement.appendChild(textDiv);

    // Add to document
    document.body.appendChild(dragElement);

    // Add drag functionality
    makeDraggable(dragElement);

    // Add click functionality to open a window
    dragElement.addEventListener("dblclick", function (e) {
        // Prevent click from triggering immediately during drag operations
        if (!this.isDragging) {
            // Create window with the icon's name as title
            createWindow(label, `This is the ${label} application window`);
        }
        // Reset the dragging flag
        this.isDragging = false;
    });
}

function makeDraggable(element) {
    let initX, initY, firstX, firstY;
    let hasMoved = false;

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
}


// Create an element for each icon
icons.forEach((icon, index) => {
    createDraggableElement(icon, index);
});

// make a sound when the page loads with the first message
setTimeout(() => {
    klick.play();
    const firstWindow = createWindow("Welcome", "This is a playground and ode to my childhood that was all anime and computer games. Its a forever work in progress. Since the internet is bland and ripped off its individuality, lets bring back the personal spirit of the old days! Feel free to stroll and frollock and if you fancy leave me a message. credits to: Kawaii Lineal color from freepik.com for the icons and Sound Effect by https://pixabay.com/users/u_fy1kpv89mt-49425146/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=31629>u_fy1kpv89mt://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=316298", '#8d95e7', 300, 500);
}, 1000);

function createWindow(title, content, headerColor = '#8d95e7', initWidth = 400, initHeight = 300) {
    const windowId = 'window-' + Date.now();
    const window = document.createElement('div');
    window.className = 'window';
    window.id = windowId;
    window.style.zIndex = zIndex++;
    window.style.top = (50 + Math.random() * 100) + 'px';
    window.style.left = (50 + Math.random() * 100) + 'px';
    window.style.width = `${initWidth}`+'px';
    window.style.height = `${initHeight}`+'px';

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

    if (typeof content === 'string') {
        windowContent.innerHTML = content;
    } else {
        windowContent.appendChild(content);
    }

    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'window-resize-handle';

    // Assemble window
    window.appendChild(header);
    window.appendChild(windowContent);
    window.appendChild(resizeHandle);

    document.body.appendChild(window);

    // Add to taskbar
    addToTaskbar(windowId, title);

    // Add to windows array
    windows.push({
        id: windowId,
        title: title,
        element: window,
        minimized: false,
        maximized: false
    });

    // Set as active window
    setActiveWindow(window);

    // Set up event listeners
    setupDragging(window, header);
    setupResizing(window, resizeHandle);

    // Control buttons events
    minimizeBtn.addEventListener('click', () => {
        minimizeWindow(window);
    });

    maximizeBtn.addEventListener('click', () => {
        maximizeWindow(window);
    });

    closeBtn.addEventListener('click', () => {
        closeWindow(window);
    });

    // Click on window to bring to front
    window.addEventListener('mousedown', () => {
        setActiveWindow(window);
    });

    setupWindowTouchEvents(window)
    return window;
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



    // Get reference to the time element
    const timeElement = document.getElementById('taskbar-time');

    // Insert taskbar item before the time element
    // This is the key change - insert before the clock, not after
    taskbar.insertBefore(taskbarItem, timeElement);
}



// handle all the window events
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
    }
}

// Maximize window
function maximizeWindow(windowElement) {
    const windowObj = windows.find(w => w.id === windowElement.id);
    if (windowObj) {
        if (windowObj.maximized) {
            // Restore to original size
            windowObj.maximized = false;
            windowElement.classList.remove('maximized');
        } else {
            // Maximize
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

// Setup window dragging
function setupDragging(windowElement, headerElement) {
    let offsetX, offsetY;

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
}

// Setup window resizing
function setupResizing(windowElement, resizeHandle) {
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
}

// touch events

function makeDraggableTouchFriendly(element) {
    let initX, initY, firstX, firstY;
    let hasMoved = false;
    let touchStartTime;

    // Add touch event listeners
    element.addEventListener("touchstart", function(e) {
        e.preventDefault(); // Prevent default touch behavior like scrolling

        touchStartTime = new Date().getTime();

        const touch = e.touches[0];
        initX = this.offsetLeft;
        initY = this.offsetTop;
        firstX = touch.pageX;
        firstY = touch.pageY;
        hasMoved = false;

        const touchMoveHandler = function(e) {
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
            const tapDuration = touchEndTime - touchStartTime;

            // Only mark as dragging if actually moved
            if (!hasMoved) {
                element.isDragging = false;

                // Detect double-tap (within 300ms of last tap)
                if (element.lastTapTime && (touchEndTime - element.lastTapTime) < 300) {
                    // Double-tap detected - open window
                    const label = element.querySelector('.drag-element-text p').textContent;
                    createWindow(label, `This is the ${label} application window`);
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

// For the window dragging
function setupDraggingTouchFriendly(windowElement, headerElement) {
    let offsetX, offsetY;

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

// For window resizing
function setupResizingTouchFriendly(windowElement, resizeHandle) {
    let startX, startY, startWidth, startHeight;

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

// Update your existing functions to add touch support
function makeDraggable(element) {
    // Keep your existing mouse code

    // Add touch support
    makeDraggableTouchFriendly(element);
}

function setupDragging(windowElement, headerElement) {
    // Keep your existing mouse code

    // Add touch support
    setupDraggingTouchFriendly(windowElement, headerElement);
}

function setupResizing(windowElement, resizeHandle) {
    // Keep your existing mouse code

    // Add touch support
    setupResizingTouchFriendly(windowElement, resizeHandle);
}

// Also add touch events to window control buttons
function addTouchToWindowControls() {
    // For minimize button
    document.querySelectorAll('.window-minimize').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const windowElement = btn.closest('.window');
            minimizeWindow(windowElement);
        });
    });

    // For maximize button
    document.querySelectorAll('.window-maximize').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const windowElement = btn.closest('.window');
            maximizeWindow(windowElement);
        });
    });

    // For close button
    document.querySelectorAll('.window-close').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const windowElement = btn.closest('.window');
            closeWindow(windowElement);
        });
    });
}

// Call this function whenever you create a new window
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
