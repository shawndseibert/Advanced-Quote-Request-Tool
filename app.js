// Modular Quote Request Builder
// State Management
let modules = [];
let moduleIdCounter = 0;
let currentEditingModuleId = null;
let currentModuleToSave = null;
let customModules = [];
let customPresets = [];

// Built-in Presets
const builtInPresets = [
    {
        name: "Standard Door Quote",
        description: "Complete door specification with dimensions, material, and hardware",
        isBuiltIn: true,
        modules: [
            { type: "title", label: "Document Title", value: "DOOR QUOTE REQUEST" },
            { type: "heading", label: "Door Specification", value: "" },
            { type: "radio", label: "Door Type", value: "", options: ["Interior", "Exterior"] },
            { type: "select", label: "Material", value: "", options: ["Solid Wood", "MDF", "Hollow Core", "Steel", "Fiberglass"] },
            { type: "select", label: "Style", value: "", options: ["Panel", "Flush", "French", "Barn Door", "Contemporary"] },
            { type: "radio", label: "Configuration", value: "", options: ["Pre-hung (with frame)", "Slab Only"] },
            { type: "dimension", label: "Dimensions", value: "" },
            { type: "text", label: "Finish/Color", value: "", placeholder: "e.g., Natural Oak, White" },
            { type: "checkbox", label: "Hardware Needed", value: "", options: ["Hinges", "Handle/Lockset", "Deadbolt"] },
            { type: "text", label: "Quantity", value: "1", placeholder: "1" },
            { type: "textarea", label: "Additional Requirements", value: "", placeholder: "Any special notes..." },
            { type: "contact", label: "Contact Information", value: "" },
            { type: "footer", label: "Footer Message", value: "Please provide a quote including pricing, lead time, and\navailability. Thank you for your assistance." }
        ]
    },
    {
        name: "Window Quote",
        description: "Window specification with size, style, and installation details",
        isBuiltIn: true,
        modules: [
            { type: "title", label: "Document Title", value: "WINDOW QUOTE REQUEST" },
            { type: "heading", label: "Window Specification", value: "" },
            { type: "radio", label: "Window Type", value: "", options: ["Double Hung", "Casement", "Sliding", "Bay", "Bow"] },
            { type: "select", label: "Frame Material", value: "", options: ["Vinyl", "Wood", "Aluminum", "Fiberglass", "Composite"] },
            { type: "dimension", label: "Dimensions", value: "" },
            { type: "select", label: "Glass Type", value: "", options: ["Single Pane", "Double Pane", "Triple Pane", "Low-E", "Tempered"] },
            { type: "text", label: "Quantity", value: "1", placeholder: "1" },
            { type: "textarea", label: "Additional Requirements", value: "", placeholder: "Installation notes, special features..." },
            { type: "contact", label: "Contact Information", value: "" },
            { type: "footer", label: "Footer Message", value: "Please provide a quote including pricing, lead time, and\navailability. Thank you for your assistance." }
        ]
    },
    {
        name: "Custom Product Quote",
        description: "Flexible template for any product or service",
        isBuiltIn: true,
        modules: [
            { type: "title", label: "Document Title", value: "QUOTE REQUEST" },
            { type: "heading", label: "Product Details", value: "" },
            { type: "text", label: "Product Name", value: "", placeholder: "Enter product name" },
            { type: "textarea", label: "Description", value: "", placeholder: "Describe what you need..." },
            { type: "text", label: "Quantity", value: "1", placeholder: "1" },
            { type: "textarea", label: "Additional Requirements", value: "", placeholder: "Any special requirements..." },
            { type: "contact", label: "Contact Information", value: "" },
            { type: "footer", label: "Footer Message", value: "Please provide a quote including pricing, lead time, and\navailability. Thank you for your assistance." }
        ]
    }
];

// Load custom modules and presets from localStorage
function loadCustomData() {
    const savedCustomModules = localStorage.getItem('customModules');
    if (savedCustomModules) {
        try {
            customModules = JSON.parse(savedCustomModules);
        } catch (e) {
            console.error('Failed to load custom modules:', e);
            customModules = [];
        }
    }
    
    const savedCustomPresets = localStorage.getItem('customPresets');
    if (savedCustomPresets) {
        try {
            customPresets = JSON.parse(savedCustomPresets);
        } catch (e) {
            console.error('Failed to load custom presets:', e);
            customPresets = [];
        }
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadCustomData();
    initializeApp();
    attachEventListeners();
    loadSavedPresets();
});

function initializeApp() {
    // Load any saved state from localStorage
    const savedState = localStorage.getItem('quoteBuilderModules');
    if (savedState) {
        try {
            modules = JSON.parse(savedState);
            renderModules();
        } catch (e) {
            console.error('Failed to load saved state:', e);
        }
    }
}

function attachEventListeners() {
    // Toolbar buttons
    document.getElementById('customModulesBtn').addEventListener('click', () => openCustomModulesModal());
    document.getElementById('presetsBtn').addEventListener('click', () => openPresetModal());
    document.getElementById('savePresetBtn').addEventListener('click', () => openModal('savePresetModal'));
    document.getElementById('generateBtn').addEventListener('click', generateQuote);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllModules);
    
    // Modal close buttons
    document.getElementById('modalCloseBtn').addEventListener('click', () => closeModal('moduleModal'));
    document.getElementById('presetModalCloseBtn').addEventListener('click', () => closeModal('presetModal'));
    document.getElementById('savePresetModalCloseBtn').addEventListener('click', () => closeModal('savePresetModal'));
    document.getElementById('editOptionsModalCloseBtn').addEventListener('click', () => closeModal('editOptionsModal'));
    document.getElementById('customModulesModalCloseBtn').addEventListener('click', () => closeModal('customModulesModal'));
    document.getElementById('saveCustomModuleModalCloseBtn').addEventListener('click', () => closeModal('saveCustomModuleModal'));
    
    // Module type selection
    const moduleCards = document.querySelectorAll('.module-card');
    moduleCards.forEach(card => {
        card.addEventListener('click', function() {
            const moduleType = this.getAttribute('data-module');
            addModule(moduleType);
            closeModal('moduleModal');
        });
    });
    // Save preset
    document.getElementById('confirmSavePresetBtn').addEventListener('click', savePreset);
    document.getElementById('cancelPresetBtn').addEventListener('click', () => closeModal('savePresetModal'));
    
    // Edit options modal
    document.getElementById('addOptionBtn').addEventListener('click', () => addOptionField());
    document.getElementById('saveOptionsBtn').addEventListener('click', saveOptions);
    document.getElementById('cancelOptionsBtn').addEventListener('click', () => closeModal('editOptionsModal'));
    
    // Custom module modal
    document.getElementById('confirmSaveCustomModuleBtn').addEventListener('click', saveCustomModule);
    document.getElementById('cancelCustomModuleBtn').addEventListener('click', () => closeModal('saveCustomModuleModal'));
    
    // Output actions
    // Output actions
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('downloadBtn').addEventListener('click', downloadQuote);
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
}

// Module Management
function addModule(type, config = {}) {
    const module = {
        id: moduleIdCounter++,
        type: type,
        label: config.label || getDefaultLabel(type),
        value: config.value || '',
        placeholder: config.placeholder || '',
        options: config.options || []
    };
    
    modules.push(module);
    renderModules();
    saveState();
}

function getDefaultLabel(type) {
    const labels = {
        text: 'Text Field',
        textarea: 'Text Area',
        select: 'Dropdown Selection',
        radio: 'Radio Selection',
        checkbox: 'Checkbox Options',
        dimension: 'Dimensions',
        contact: 'Contact Information',
        heading: 'Section Heading',
        title: 'Document Title',
        footer: 'Footer Message'
    };
    return labels[type] || 'Field';
}

function deleteModule(id) {
    if (confirm('Delete this module?')) {
        modules = modules.filter(m => m.id !== id);
        renderModules();
        saveState();
    }
}

function editModuleLabel(id) {
    const module = modules.find(m => m.id === id);
    if (!module) return;
    
    const newLabel = prompt('Enter new label:', module.label);
    if (newLabel !== null && newLabel.trim() !== '') {
        module.label = newLabel.trim();
        renderModules();
        saveState();
    }
}

function moveModule(id, direction) {
    const index = modules.findIndex(m => m.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;
    
    [modules[index], modules[newIndex]] = [modules[newIndex], modules[index]];
    renderModules();
    saveState();
}

function renderModules() {
    const container = document.getElementById('modulesContainer');
    
    if (modules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No modules yet</h3>
                <p>Click "Add Module" to start building your quote request</p>
                <p class="tip">💡 Tip: Try loading a preset to get started quickly!</p>
                <button type="button" class="btn btn-primary" onclick="document.getElementById('moduleModal').classList.remove('hidden')" style="margin-top: 20px; font-size: 1rem; padding: 12px 24px;">
                    <span class="icon">+</span> Add Module
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = modules.map((module, index) => createModuleHTML(module, index)).join('');
    
    // Add the floating add button at the bottom
    const addBtn = document.createElement('button');
    addBtn.className = 'floating-add-btn';
    addBtn.innerHTML = '<span class="icon">+</span> Add Module';
    addBtn.addEventListener('click', () => openModal('moduleModal'));
    container.appendChild(addBtn);
    
    // Attach event listeners to module elements
    attachModuleListeners();
}

function createModuleHTML(module, index) {
    const canMoveUp = index > 0;
    const canMoveDown = index < modules.length - 1;
    
    let bodyHTML = '';
    
    switch (module.type) {
        case 'text':
            bodyHTML = `
                <input type="text" 
                       class="module-input" 
                       data-module-id="${module.id}"
                       placeholder="${module.placeholder || 'Enter text...'}" 
                       value="${module.value}">
            `;
            break;
            
        case 'textarea':
            bodyHTML = `
                <textarea class="module-textarea" 
                          data-module-id="${module.id}"
                          placeholder="${module.placeholder || 'Enter text...'}" 
                          rows="4">${module.value}</textarea>
            `;
            break;
            
        case 'select':
            bodyHTML = `
                <select class="module-select" data-module-id="${module.id}">
                    <option value="">Select an option</option>
                    ${module.options.map(opt => `<option value="${opt}" ${module.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
                <button class="btn btn-secondary" style="margin-top: 10px;" onclick="editOptions(${module.id})">
                    Edit Options
                </button>
            `;
            break;
            
        case 'radio':
            bodyHTML = `
                <div class="options-grid">
                    ${module.options.map((opt, i) => `
                        <label class="option-item">
                            <input type="radio" 
                                   name="radio-${module.id}" 
                                   value="${opt}" 
                                   data-module-id="${module.id}"
                                   ${module.value === opt ? 'checked' : ''}>
                            <span class="option-label">${opt}</span>
                        </label>
                    `).join('')}
                </div>
                <button class="btn btn-secondary" style="margin-top: 15px;" onclick="editOptions(${module.id})">
                    Edit Options
                </button>
            `;
            break;
            
        case 'checkbox':
            const values = module.value ? module.value.split(',') : [];
            bodyHTML = `
                <div class="options-grid">
                    ${module.options.map((opt, i) => `
                        <label class="option-item">
                            <input type="checkbox" 
                                   name="checkbox-${module.id}" 
                                   value="${opt}" 
                                   data-module-id="${module.id}"
                                   ${values.includes(opt) ? 'checked' : ''}>
                            <span class="option-label">${opt}</span>
                        </label>
                    `).join('')}
                </div>
                <button class="btn btn-secondary" style="margin-top: 15px;" onclick="editOptions(${module.id})">
                    Edit Options
                </button>
            `;
            break;
            
        case 'dimension':
            const dims = module.value ? module.value.split('|') : ['', '', ''];
            bodyHTML = `
                <div class="dimension-grid">
                    <div>
                        <label class="module-label">Width</label>
                        <input type="text" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-dimension="width"
                               placeholder="e.g., 3' 0&quot;" 
                               value="${dims[0] || ''}">
                    </div>
                    <div>
                        <label class="module-label">Height</label>
                        <input type="text" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-dimension="height"
                               placeholder="e.g., 6' 8&quot;" 
                               value="${dims[1] || ''}">
                    </div>
                    <div>
                        <label class="module-label">Depth/Thickness</label>
                        <input type="text" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-dimension="depth"
                               placeholder="e.g., 1¾&quot;" 
                               value="${dims[2] || ''}">
                    </div>
                </div>
            `;
            break;
            
        case 'contact':
            const contact = module.value ? module.value.split('|') : ['', '', ''];
            bodyHTML = `
                <div class="dimension-grid">
                    <div>
                        <label class="module-label">Name</label>
                        <input type="text" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-contact="name"
                               placeholder="Your name" 
                               value="${contact[0] || ''}">
                    </div>
                    <div>
                        <label class="module-label">Email</label>
                        <input type="email" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-contact="email"
                               placeholder="email@example.com" 
                               value="${contact[1] || ''}">
                    </div>
                    <div>
                        <label class="module-label">Phone</label>
                        <input type="tel" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-contact="phone"
                               placeholder="(555) 123-4567" 
                               value="${contact[2] || ''}">
                    </div>
                </div>
            `;
            break;
            
        case 'heading':
            bodyHTML = `
                <input type="text" 
                       class="module-input" 
                       data-module-id="${module.id}"
                       placeholder="Enter section heading..." 
                       value="${module.value}"
                       style="font-size: 1.2rem; font-weight: 600;">
            `;
            break;
            
        case 'title':
            bodyHTML = `
                <input type="text" 
                       class="module-input" 
                       data-module-id="${module.id}"
                       placeholder="QUOTE REQUEST" 
                       value="${module.value}"
                       style="font-size: 1.3rem; font-weight: bold; text-align: center;">
            `;
            break;
            
        case 'footer':
            bodyHTML = `
                <textarea class="module-textarea" 
                          data-module-id="${module.id}"
                          placeholder="Please provide a quote including pricing, lead time, and&#10;availability. Thank you for your assistance."
                          style="min-height: 80px;">${module.value}</textarea>
            `;
            break;
    }
    
    return `
        <div class="module-bubble" data-module-id="${module.id}" draggable="true">
            <div class="module-header">
                <div class="module-title">
                    <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                    <span class="icon">${getModuleIcon(module.type)}</span>
                    ${module.label}
                </div>
                <div class="module-actions">
                    <button class="module-btn" onclick="openSaveCustomModuleModal(${module.id})" title="Save as Custom">⭐</button>
                    ${canMoveUp ? `<button class="module-btn" onclick="moveModule(${module.id}, 'up')" title="Move Up">▲</button>` : ''}
                    ${canMoveDown ? `<button class="module-btn" onclick="moveModule(${module.id}, 'down')" title="Move Down">▼</button>` : ''}
                    <button class="module-btn" onclick="editModuleLabel(${module.id})" title="Edit Label">✏️</button>
                    <button class="module-btn delete" onclick="deleteModule(${module.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="module-body">
                ${bodyHTML}
            </div>
        </div>
    `;
}

function getModuleIcon(type) {
    const icons = {
        text: '📝',
        textarea: '📄',
        select: '📋',
        radio: '🔘',
        checkbox: '☑️',
        dimension: '📏',
        contact: '👤',
        heading: '📌',
        title: '🏷️',
        footer: '📄'
    };
    return icons[type] || '📦';
}

function attachModuleListeners() {
    // Text inputs
    document.querySelectorAll('.module-input, .module-textarea, .module-select').forEach(input => {
        input.addEventListener('change', function() {
            updateModuleValue(this);
        });
    });
    
    // Radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateModuleValue(this);
        });
    });
    
    // Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateModuleCheckboxValue(this);
        });
    });
    
    // Drag and drop functionality
    const moduleBubbles = document.querySelectorAll('.module-bubble');
    const container = document.getElementById('modulesContainer');
    
    moduleBubbles.forEach(bubble => {
        bubble.addEventListener('dragstart', handleDragStart);
        bubble.addEventListener('dragend', handleDragEnd);
        bubble.addEventListener('dragover', handleDragOver);
        bubble.addEventListener('drop', handleDrop);
        bubble.addEventListener('dragenter', handleDragEnter);
        bubble.addEventListener('dragleave', handleDragLeave);
    });
    
    // Also add drop handler to container as fallback
    if (container) {
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
            return false;
        });
        container.addEventListener('drop', function(e) {
            e.preventDefault();
            console.log('DROP on container - positions already updated during drag');
            
            // Reset transforms on all bubbles
            document.querySelectorAll('.module-bubble').forEach(bubble => {
                bubble.style.transform = '';
            });
            
            // No need to reorder - already done in dragEnter
            // Just ensure state is saved
            saveState();
            
            return false;
        });
    }
}

let draggedElement = null;
let draggedModuleId = null;
let lastDragOverElement = null;
let dragClone = null;
let swapInProgress = false;

function handleDragStart(e) {
    draggedElement = this;
    draggedModuleId = parseInt(this.getAttribute('data-module-id'));
    
    // Create a clone that follows the cursor
    dragClone = this.cloneNode(true);
    dragClone.id = 'drag-clone';
    dragClone.style.position = 'fixed';
    dragClone.style.pointerEvents = 'none';
    dragClone.style.zIndex = '10000';
    dragClone.style.opacity = '0.95';
    dragClone.style.width = this.offsetWidth + 'px';
    dragClone.style.transform = 'rotate(2deg)';
    dragClone.style.transition = 'none';
    dragClone.style.left = (e.clientX + 10) + 'px';
    dragClone.style.top = (e.clientY + 10) + 'px';
    document.body.appendChild(dragClone);
    
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedModuleId);
    
    // Hide the default ghost image
    const emptyImg = document.createElement('img');
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
    
    console.log('DRAG START - ID:', draggedModuleId);
    
    // Add mousemove listener to update clone position
    document.addEventListener('dragover', updateClonePosition);
}

function updateClonePosition(e) {
    if (dragClone) {
        dragClone.style.left = (e.clientX + 10) + 'px';
        dragClone.style.top = (e.clientY + 10) + 'px';
    }
}

function handleDragEnd(e) {
    console.log('DRAG END');
    this.classList.remove('dragging');
    
    // Remove the clone
    if (dragClone) {
        dragClone.remove();
        dragClone = null;
    }
    
    // Remove the document-level dragover listener
    document.removeEventListener('dragover', updateClonePosition);
    
    // Remove all drag-over classes
    document.querySelectorAll('.module-bubble').forEach(bubble => {
        bubble.classList.remove('drag-over');
    });
    
    draggedElement = null;
    draggedModuleId = null;
    lastDragOverElement = null;
    swapInProgress = false;
}
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedElement) return false;
    
    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

function handleDragEnter(e) {
    e.preventDefault();
    
    // Prevent rapid-fire swaps
    if (swapInProgress) return false;
    
    if (this !== draggedElement && this !== lastDragOverElement && this.classList && this.classList.contains('module-bubble')) {
        const targetModuleId = parseInt(this.getAttribute('data-module-id'));
        console.log('DRAG ENTER - Target ID:', targetModuleId, 'Swapping now');
        
        // Lock swapping temporarily
        swapInProgress = true;
        
        // Remove drag-over from previous
        if (lastDragOverElement) {
            lastDragOverElement.classList.remove('drag-over');
        }
        
        this.classList.add('drag-over');
        lastDragOverElement = this;
        
        // Immediately swap positions when entering a new module
        if (draggedElement) {
            const draggedModuleId = parseInt(draggedElement.getAttribute('data-module-id'));
            const draggedIndex = modules.findIndex(m => m.id === draggedModuleId);
            const targetIndex = modules.findIndex(m => m.id === targetModuleId);
            
            if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
                // Swap in the array
                [modules[draggedIndex], modules[targetIndex]] = [modules[targetIndex], modules[draggedIndex]];
                
                // Swap in the DOM
                const container = document.getElementById('modulesContainer');
                const allBubbles = Array.from(container.querySelectorAll('.module-bubble'));
                const draggedDOMIndex = allBubbles.indexOf(draggedElement);
                const targetDOMIndex = allBubbles.indexOf(this);
                
                // Store reference to the target before swapping
                const targetElement = this;
                
                if (draggedDOMIndex < targetDOMIndex) {
                    // Insert dragged after target
                    targetElement.parentNode.insertBefore(draggedElement, targetElement.nextSibling);
                } else {
                    // Insert dragged before target
                    targetElement.parentNode.insertBefore(draggedElement, targetElement);
                }
                
                // The draggedElement DOM node has moved, but the reference is still valid
                // We need to clear lastDragOverElement since positions changed
                lastDragOverElement = null;
                
                saveState();
            }
        }
        
        // Unlock swapping after a brief delay
        setTimeout(() => {
            swapInProgress = false;
        }, 150);
    }
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function updateDragPreview(targetElement) {
    if (!draggedElement || !targetElement) return;
    
    const container = document.getElementById('modulesContainer');
    const allBubbles = Array.from(container.querySelectorAll('.module-bubble'));
    
    // Get current DOM positions
    const draggedDOMIndex = allBubbles.indexOf(draggedElement);
    const targetDOMIndex = allBubbles.indexOf(targetElement);
    
    // Calculate the height of the dragged element
    const draggedHeight = draggedElement.offsetHeight + 15; // Include margin
    
    // Reset all non-dragging transforms first
    allBubbles.forEach(bubble => {
        if (bubble !== draggedElement) {
            bubble.style.transform = '';
            bubble.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
    });
    
    // Shift elements to show where the card will be inserted
    allBubbles.forEach((bubble, bubbleIndex) => {
        if (bubble === draggedElement) return;
        
        if (draggedDOMIndex < targetDOMIndex) {
            // Dragging down: shift elements up that are between dragged and target
            if (bubbleIndex > draggedDOMIndex && bubbleIndex <= targetDOMIndex) {
                bubble.style.transform = `translateY(-${draggedHeight}px)`;
            }
        } else {
            // Dragging up: shift elements down that are between target and dragged
            if (bubbleIndex >= targetDOMIndex && bubbleIndex < draggedDOMIndex) {
                bubble.style.transform = `translateY(${draggedHeight}px)`;
            }
        }
    });
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('DROP TRIGGERED on element:', this.getAttribute('data-module-id'));
    
    this.classList.remove('drag-over');
    
    // Reset transforms on all bubbles
    document.querySelectorAll('.module-bubble').forEach(bubble => {
        bubble.style.transform = '';
    });
    
    if (draggedElement && draggedElement !== this) {
        const targetModuleId = parseInt(this.getAttribute('data-module-id'));
        
        // Find the indices in the modules array
        const draggedIndex = modules.findIndex(m => m.id === draggedModuleId);
        const targetIndex = modules.findIndex(m => m.id === targetModuleId);
        
        console.log('DROP - Dragged ID:', draggedModuleId, 'Target ID:', targetModuleId);
        console.log('Array indices - Dragged:', draggedIndex, 'Target:', targetIndex);
        console.log('Before reorder:', modules.map(m => `${m.id}:${m.label}`).join(', '));
        
        if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
            // Reorder the modules array
            const [draggedModule] = modules.splice(draggedIndex, 1);
            modules.splice(targetIndex, 0, draggedModule);
            
            console.log('After reorder:', modules.map(m => `${m.id}:${m.label}`).join(', '));
            console.log('CALLING RENDER MODULES NOW');
            
            // Save and re-render
            saveState();
            renderModules();
            
            console.log('Render complete - check if modules moved');
        } else {
            console.log('Reorder skipped - indices invalid or same');
        }
    } else {
        console.log('Drop on self or no dragged element');
    }
    
    return false;
}

function updateModuleValue(element) {
    const moduleId = parseInt(element.getAttribute('data-module-id'));
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    // Handle dimension fields
    if (element.hasAttribute('data-dimension')) {
        const dimensionType = element.getAttribute('data-dimension');
        const dims = module.value ? module.value.split('|') : ['', '', ''];
        const dimIndex = ['width', 'height', 'depth'].indexOf(dimensionType);
        dims[dimIndex] = element.value;
        module.value = dims.join('|');
    }
    // Handle contact fields
    else if (element.hasAttribute('data-contact')) {
        const contactType = element.getAttribute('data-contact');
        const contact = module.value ? module.value.split('|') : ['', '', ''];
        const contactIndex = ['name', 'email', 'phone'].indexOf(contactType);
        contact[contactIndex] = element.value;
        module.value = contact.join('|');
    }
    // Handle regular fields
    else {
        module.value = element.value;
    }
    
    saveState();
}

function updateModuleCheckboxValue(element) {
    const moduleId = parseInt(element.getAttribute('data-module-id'));
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const checkboxes = document.querySelectorAll(`input[name="checkbox-${moduleId}"]:checked`);
    const values = Array.from(checkboxes).map(cb => cb.value);
    module.value = values.join(',');
    
    saveState();
}

function editOptions(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    currentEditingModuleId = moduleId;
    
    // Populate the options list
    const optionsList = document.getElementById('optionsList');
    optionsList.innerHTML = '';
    
    if (module.options.length === 0) {
        addOptionField();
    } else {
        module.options.forEach(option => {
            addOptionField(option);
        });
    }
    
    openModal('editOptionsModal');
}

function addOptionField(value = '') {
    const optionsList = document.getElementById('optionsList');
    const optionItem = document.createElement('div');
    optionItem.className = 'option-editor-item';
    
    // Create elements instead of using innerHTML to avoid escaping issues
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-input';
    input.value = value;
    input.placeholder = 'Enter option...';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-option-btn';
    deleteBtn.title = 'Delete';
    deleteBtn.textContent = '🗑️';
    
    // Add delete listener
    deleteBtn.addEventListener('click', function() {
        optionItem.remove();
    });
    
    optionItem.appendChild(input);
    optionItem.appendChild(deleteBtn);
    optionsList.appendChild(optionItem);
    
    // Focus on the new input
    input.focus();
}

function saveOptions() {
    if (currentEditingModuleId === null) return;
    
    const module = modules.find(m => m.id === currentEditingModuleId);
    if (!module) return;
    
    // Collect all option values
    const optionInputs = document.querySelectorAll('#optionsList .option-input');
    const newOptions = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    if (newOptions.length === 0) {
        alert('Please add at least one option');
        return;
    }
    
    module.options = newOptions;
    
    // Clear the module value if it's no longer in the options
    if (module.type === 'select' || module.type === 'radio') {
        if (!newOptions.includes(module.value)) {
            module.value = '';
        }
    } else if (module.type === 'checkbox') {
        const currentValues = module.value ? module.value.split(',') : [];
        const validValues = currentValues.filter(v => newOptions.includes(v));
        module.value = validValues.join(',');
    }
    
    renderModules();
    saveState();
    closeModal('editOptionsModal');
    currentEditingModuleId = null;
}

// Preset Management
function openPresetModal() {
    const grid = document.getElementById('presetGrid');
    const allPresets = [...builtInPresets, ...customPresets];
    
    if (allPresets.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No presets available</p>';
    } else {
        grid.innerHTML = allPresets.map(preset => createPresetCard(preset)).join('');
    }
    
    openModal('presetModal');
    
    // Attach preset click listeners
    setTimeout(() => {
        document.querySelectorAll('.preset-card[data-preset-name]').forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('preset-delete')) {
                    const presetName = this.getAttribute('data-preset-name');
                    loadPreset(presetName);
                }
            });
        });
        
        document.querySelectorAll('.preset-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const presetName = this.getAttribute('data-preset-name');
                deletePreset(presetName);
            });
        });
    }, 100);
}

function createPresetCard(preset) {
    const isBuiltIn = preset.isBuiltIn;
    return `
        <div class="preset-card" data-preset-name="${preset.name}">
            ${isBuiltIn ? '<span class="preset-badge">Built-in</span>' : ''}
            <h3>${preset.name}</h3>
            <p>${preset.description}</p>
            ${preset.tags && preset.tags.length > 0 ? `
                <div class="tag-container">
                    ${preset.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            ${!isBuiltIn ? `<button class="preset-delete" data-preset-name="${preset.name}" title="Delete">🗑️</button>` : ''}
        </div>
    `;
}

function loadPreset(presetName) {
    const allPresets = [...builtInPresets, ...customPresets];
    const preset = allPresets.find(p => p.name === presetName);
    
    if (!preset) return;
    
    if (modules.length > 0) {
        if (!confirm('This will replace your current modules. Continue?')) {
            return;
        }
    }
    
    modules = preset.modules.map(m => ({
        ...m,
        id: moduleIdCounter++
    }));
    
    renderModules();
    saveState();
    closeModal('presetModal');
}

function savePreset() {
    const name = document.getElementById('presetName').value.trim();
    const description = document.getElementById('presetDescription').value.trim();
    
    if (!name) {
        alert('Please enter a preset name');
        return;
    }
    
    if (modules.length === 0) {
        alert('Cannot save empty preset. Add some modules first.');
        return;
    }
    
    // Get tags from input field
    const tagsInput = document.getElementById('presetTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const preset = {
        name: name,
        description: description || 'Custom preset',
        isBuiltIn: false,
        tags: tags,
        modules: modules.map(m => ({...m, id: undefined})) // Remove IDs for preset
    };
    
    const existingIndex = customPresets.findIndex(p => p.name === name);
    
    if (existingIndex >= 0) {
        if (!confirm(`Preset "${name}" already exists. Overwrite?`)) {
            return;
        }
        customPresets[existingIndex] = preset;
    } else {
        customPresets.push(preset);
    }
    
    localStorage.setItem('customPresets', JSON.stringify(customPresets));
    
    document.getElementById('presetName').value = '';
    document.getElementById('presetDescription').value = '';
    document.getElementById('presetTags').value = '';
    
    closeModal('savePresetModal');
    alert('Preset saved successfully!');
}

function deletePreset(presetName) {
    if (!confirm(`Delete preset "${presetName}"?`)) {
        return;
    }
    
    customPresets = customPresets.filter(p => p.name !== presetName);
    localStorage.setItem('customPresets', JSON.stringify(customPresets));
    
    openPresetModal(); // Refresh the modal
}

// Quote Generation
function generateQuote() {
    if (modules.length === 0) {
        alert('Add some modules first!');
        return;
    }
    
    let quoteText = '';
    
    modules.forEach(module => {
        if (!module.value && module.type !== 'heading' && module.type !== 'title' && module.type !== 'footer') return; // Skip empty modules
        
        switch (module.type) {
            case 'title':
                quoteText += '═══════════════════════════════════════════════════════════\n';
                quoteText += `${module.value || 'QUOTE REQUEST'}\n`;
                quoteText += '═══════════════════════════════════════════════════════════\n';
                quoteText += `Date: ${new Date().toLocaleDateString()}\n\n`;
                break;
                
            case 'heading':
                quoteText += '─────────────────────────────────────────────────────────\n';
                quoteText += `${module.value.toUpperCase() || module.label.toUpperCase()}\n`;
                quoteText += '─────────────────────────────────────────────────────────\n';
                break;
                
            case 'dimension':
                const dims = module.value.split('|');
                quoteText += `${module.label}:\n`;
                if (dims[0]) quoteText += `  Width:     ${dims[0]}\n`;
                if (dims[1]) quoteText += `  Height:    ${dims[1]}\n`;
                if (dims[2]) quoteText += `  Depth:     ${dims[2]}\n`;
                quoteText += '\n';
                break;
                
            case 'contact':
                const contact = module.value.split('|');
                quoteText += `${module.label}:\n`;
                if (contact[0]) quoteText += `  Name:      ${contact[0]}\n`;
                if (contact[1]) quoteText += `  Email:     ${contact[1]}\n`;
                if (contact[2]) quoteText += `  Phone:     ${contact[2]}\n`;
                quoteText += '\n';
                break;
                
            case 'checkbox':
                if (module.value) {
                    quoteText += `${module.label}:\n`;
                    module.value.split(',').forEach(val => {
                        quoteText += `  • ${val}\n`;
                    });
                    quoteText += '\n';
                }
                break;
                
            case 'textarea':
                quoteText += `${module.label}:\n`;
                quoteText += `${module.value}\n\n`;
                break;
                
            case 'footer':
                quoteText += '\n═══════════════════════════════════════════════════════════\n';
                quoteText += `${module.value || 'Please provide a quote including pricing, lead time, and\navailability. Thank you for your assistance.'}\n`;
                quoteText += '═══════════════════════════════════════════════════════════\n';
                break;
                
            default:
                quoteText += `${module.label}:     ${module.value}\n`;
                break;
        }
    });
    
    document.getElementById('quoteOutput').textContent = quoteText;
    document.getElementById('outputSection').classList.remove('hidden');
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyToClipboard() {
    const quoteText = document.getElementById('quoteOutput').textContent;
    
    navigator.clipboard.writeText(quoteText).then(function() {
        const notification = document.getElementById('copyNotification');
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }).catch(function(err) {
        alert('Failed to copy to clipboard');
        console.error('Copy failed:', err);
    });
}

function downloadQuote() {
    const quoteText = document.getElementById('quoteOutput').textContent;
    const blob = new Blob([quoteText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-request-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function clearAllModules() {
    if (modules.length === 0) return;
    
    if (confirm('Clear all modules? This cannot be undone.')) {
        modules = [];
        renderModules();
        saveState();
        document.getElementById('outputSection').classList.add('hidden');
    }
}

function saveState() {
    localStorage.setItem('quoteBuilderModules', JSON.stringify(modules));
}

// Custom Modules Functions
function openCustomModulesModal() {
    renderCustomModules();
    openModal('customModulesModal');
}

function renderCustomModules() {
    const grid = document.getElementById('customModuleGrid');
    
    if (customModules.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-small">
                <p>No custom modules saved yet</p>
                <p class="tip">💡 Click "Save as Custom" on any module to add it here</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = customModules.map((module, index) => `
        <div class="custom-module-card" onclick="addCustomModule(${index})">
            <button class="custom-module-delete" onclick="event.stopPropagation(); deleteCustomModule(${index})" title="Delete">×</button>
            <h3>${module.name}</h3>
            <p class="module-type">${getModuleIcon(module.data.type)} ${capitalizeFirst(module.data.type)}</p>
            ${module.tags && module.tags.length > 0 ? `
                <div class="tag-container">
                    ${module.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function openSaveCustomModuleModal(moduleId) {
    currentModuleToSave = moduleId;
    const module = modules.find(m => m.id === moduleId);
    if (module) {
        document.getElementById('customModuleName').value = module.label;
        document.getElementById('customModuleTags').value = '';
        openModal('saveCustomModuleModal');
    }
}

function saveCustomModule() {
    const name = document.getElementById('customModuleName').value.trim();
    const tagsInput = document.getElementById('customModuleTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    if (!name) {
        alert('Please enter a module name');
        return;
    }
    
    const module = modules.find(m => m.id === currentModuleToSave);
    if (!module) {
        alert('Module not found');
        return;
    }
    
    // Create a copy of the module without the ID
    const moduleCopy = JSON.parse(JSON.stringify(module));
    delete moduleCopy.id;
    
    customModules.push({
        name: name,
        tags: tags,
        data: moduleCopy
    });
    
    localStorage.setItem('customModules', JSON.stringify(customModules));
    closeModal('saveCustomModuleModal');
    alert(`Custom module "${name}" saved!`);
}

function addCustomModule(index) {
    const customModule = customModules[index];
    if (customModule) {
        const moduleData = JSON.parse(JSON.stringify(customModule.data));
        moduleData.id = moduleIdCounter++;
        modules.push(moduleData);
        renderModules();
        saveState();
        closeModal('customModulesModal');
    }
}

function deleteCustomModule(index) {
    if (confirm('Delete this custom module?')) {
        customModules.splice(index, 1);
        localStorage.setItem('customModules', JSON.stringify(customModules));
        renderCustomModules();
    }
}

// Update savePreset to include tags
function savePreset() {
    const name = document.getElementById('presetName').value.trim();
    const description = document.getElementById('presetDescription').value.trim();
    const tagsInput = document.getElementById('presetTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    if (!name) {
        alert('Please enter a preset name');
        return;
    }
    
    if (modules.length === 0) {
        alert('No modules to save. Add some modules first.');
        return;
    }
    
    const preset = {
        name: name,
        description: description,
        tags: tags,
        isBuiltIn: false,
        modules: JSON.parse(JSON.stringify(modules)).map(m => {
            delete m.id;
            return m;
        })
    };
    
    customPresets.push(preset);
    localStorage.setItem('customPresets', JSON.stringify(customPresets));
    
    closeModal('savePresetModal');
    document.getElementById('presetName').value = '';
    document.getElementById('presetDescription').value = '';
    document.getElementById('presetTags').value = '';
    
    alert(`Preset "${name}" saved successfully!`);
}

// Make functions globally accessible
window.deleteModule = deleteModule;
window.editModuleLabel = editModuleLabel;
window.moveModule = moveModule;
window.editOptions = editOptions;
window.openSaveCustomModuleModal = openSaveCustomModuleModal;
window.addCustomModule = addCustomModule;
window.deleteCustomModule = deleteCustomModule;
