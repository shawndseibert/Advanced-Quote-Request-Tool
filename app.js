// Modular Quote Request Builder
// State Management
let modules = [];
let moduleIdCounter = 0;
let currentEditingModuleId = null;
let currentModuleToSave = null;
let customModules = [];
let customPresets = [];

// Undo/Redo History
let history = [];
let historyIndex = -1;
let isUndoRedoAction = false;

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
    
    // Initialize history with current state
    history = [JSON.parse(JSON.stringify(modules))];
    historyIndex = 0;
    updateUndoRedoButtons();
}

function attachEventListeners() {
    // Toolbar buttons
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('customModulesBtn').addEventListener('click', () => openCustomModulesModal());
    document.getElementById('presetsBtn').addEventListener('click', () => openPresetModal());
    document.getElementById('savePresetBtn').addEventListener('click', () => openModal('savePresetModal'));
    document.getElementById('clearAllBtn').addEventListener('click', clearAllModules);
    
    // Modal close buttons
    document.getElementById('modalCloseBtn').addEventListener('click', () => closeModal('moduleModal'));
    document.getElementById('presetModalCloseBtn').addEventListener('click', () => closeModal('presetModal'));
    document.getElementById('savePresetModalCloseBtn').addEventListener('click', () => closeModal('savePresetModal'));
    document.getElementById('editOptionsModalCloseBtn').addEventListener('click', () => closeModal('editOptionsModal'));
    document.getElementById('customModulesModalCloseBtn').addEventListener('click', () => closeModal('customModulesModal'));
    document.getElementById('saveCustomModuleModalCloseBtn').addEventListener('click', () => closeModal('saveCustomModuleModal'));
    document.getElementById('editDimensionPresetsModalCloseBtn').addEventListener('click', () => closeModal('editDimensionPresetsModal'));
    
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
    
    // Dimension presets modal
    document.getElementById('addWidthPresetBtn').addEventListener('click', () => addPresetField('widthPresetsList'));
    document.getElementById('addHeightPresetBtn').addEventListener('click', () => addPresetField('heightPresetsList'));
    document.getElementById('addDepthPresetBtn').addEventListener('click', () => addPresetField('depthPresetsList'));
    document.getElementById('saveDimensionPresetsBtn').addEventListener('click', saveDimensionPresets);
    document.getElementById('cancelDimensionPresetsBtn').addEventListener('click', () => closeModal('editDimensionPresetsModal'));
    
    // Custom module modal
    document.getElementById('confirmSaveCustomModuleBtn').addEventListener('click', saveCustomModule);
    document.getElementById('cancelCustomModuleBtn').addEventListener('click', () => closeModal('saveCustomModuleModal'));
    
    // Banner settings
    document.getElementById('bannerSettingsBtn').addEventListener('click', () => openModal('bannerSettingsModal'));
    document.getElementById('bannerSettingsModalCloseBtn').addEventListener('click', () => closeModal('bannerSettingsModal'));
    document.getElementById('closeBannerSettingsBtn').addEventListener('click', () => closeModal('bannerSettingsModal'));
    document.getElementById('bannerImageInput').addEventListener('change', handleBannerImageUpload);
    document.getElementById('removeBannerBtn').addEventListener('click', removeBannerImage);
    
    // Add paste event listener for banner image
    document.addEventListener('paste', handlePasteImage);
    
    // Load saved banner on startup
    loadBannerImage();
    
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
        options: config.options || [],
        required: config.required || false
    };
    
    // Add default dimension presets based on type
    if (type === 'door-dimension') {
        module.widthPresets = config.widthPresets || [
            "18|closet doors",
            "24|small interior doors",
            "28|bathroom doors",
            "30|standard interior",
            "32|standard interior",
            "36|standard exterior/ADA compliant",
            "42|double doors/wide openings",
            "48|double doors",
            "60|patio doors",
            "72|double doors",
            "96|wide double doors"
        ];
        module.heightPresets = config.heightPresets || [
            "78|older/custom doors",
            "80|standard interior",
            "84|standard exterior",
            "96|tall doors"
        ];
        module.depthPresets = config.depthPresets || [
            "1.375|hollow core interior",
            "1.75|solid core interior/standard exterior",
            "2|heavy exterior/security doors",
            "2.25|extra heavy exterior"
        ];
    } else if (type === 'window-dimension') {
        module.widthPresets = config.widthPresets || [
            "24|small window",
            "30|standard window",
            "36|standard window",
            "48|large window",
            "60|picture window",
            "72|large picture window",
            "84|bay window section",
            "96|wide picture window"
        ];
        module.heightPresets = config.heightPresets || [
            "24|short window",
            "36|standard window",
            "48|standard window",
            "60|tall window",
            "72|floor to ceiling"
        ];
        module.depthPresets = config.depthPresets || [
            "3.25|standard insulated glass",
            "4.5|triple pane",
            "5.5|energy efficient"
        ];
    } else if (type === 'dimension') {
        // Custom dimensions - no presets
        module.widthPresets = config.widthPresets || [];
        module.heightPresets = config.heightPresets || [];
        module.depthPresets = config.depthPresets || [];
    }
    
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
        dimension: 'Custom Dimensions',
        'door-dimension': 'Door Dimensions',
        'window-dimension': 'Window Dimensions',
        contact: 'Contact Information',
        heading: 'Section Heading',
        title: 'Document Title',
        footer: 'Footer Message'
    };
    return labels[type] || 'Field';
}

function toggleRequired(id) {
    const module = modules.find(m => m.id === id);
    if (!module) return;
    
    module.required = !module.required;
    renderModules();
    saveState();
}

function deleteModule(id) {
    modules = modules.filter(m => m.id !== id);
    renderModules();
    saveState();
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
    
    // Update quote in real-time if output is visible
    if (!document.getElementById('outputSection').classList.contains('hidden')) {
        updateQuoteRealTime();
    }
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
        case 'door-dimension':
        case 'window-dimension':
            const dims = module.value ? module.value.split('|') : ['', '', ''];
            const widthPresets = module.widthPresets || [];
            const heightPresets = module.heightPresets || [];
            const depthPresets = module.depthPresets || [];
            
            bodyHTML = `
                <div class="dimension-grid">
                    <div>
                        <label class="module-label">Width</label>
                        ${widthPresets.length > 0 ? `
                            <select class="module-select" 
                                    data-module-id="${module.id}" 
                                    data-dimension="width"
                                    onchange="updateDimensionFromPreset(${module.id}, 'width', this.value)">
                                <option value="">Custom...</option>
                                ${widthPresets.map(opt => {
                                    const value = getDimensionValue(opt);
                                    return `<option value="${value}" ${dims[0] === value ? 'selected' : ''}>${formatDimensionOption(opt)}</option>`;
                                }).join('')}
                            </select>
                        ` : ''}
                        <input type="text" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-dimension="width"
                               placeholder="e.g., 3' 0&quot;" 
                               value="${dims[0] || ''}"
                               ${widthPresets.length > 0 ? 'style="margin-top: 8px;"' : ''}>
                    </div>
                    <div>
                        <label class="module-label">Height</label>
                        ${heightPresets.length > 0 ? `
                            <select class="module-select" 
                                    data-module-id="${module.id}" 
                                    data-dimension="height"
                                    onchange="updateDimensionFromPreset(${module.id}, 'height', this.value)">
                                <option value="">Custom...</option>
                                ${heightPresets.map(opt => {
                                    const value = getDimensionValue(opt);
                                    return `<option value="${value}" ${dims[1] === value ? 'selected' : ''}>${formatDimensionOption(opt)}</option>`;
                                }).join('')}
                            </select>
                        ` : ''}
                        <input type="text" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-dimension="height"
                               placeholder="e.g., 6' 8&quot;" 
                               value="${dims[1] || ''}"
                               ${heightPresets.length > 0 ? 'style="margin-top: 8px;"' : ''}>
                    </div>
                    <div>
                        <label class="module-label">Depth/Thickness</label>
                        ${depthPresets.length > 0 ? `
                            <select class="module-select" 
                                    data-module-id="${module.id}" 
                                    data-dimension="depth"
                                    onchange="updateDimensionFromPreset(${module.id}, 'depth', this.value)">
                                <option value="">Custom...</option>
                                ${depthPresets.map(opt => {
                                    const value = getDimensionValue(opt);
                                    return `<option value="${value}" ${dims[2] === value ? 'selected' : ''}>${formatDimensionOption(opt)}</option>`;
                                }).join('')}
                            </select>
                        ` : ''}
                        <input type="text" 
                               class="module-input" 
                               data-module-id="${module.id}" 
                               data-dimension="depth"
                               placeholder="e.g., 1¾&quot;" 
                               value="${dims[2] || ''}"
                               ${depthPresets.length > 0 ? 'style="margin-top: 8px;"' : ''}>
                    </div>
                </div>
                <button class="btn btn-secondary" style="margin-top: 15px;" onclick="editDimensionPresets(${module.id})">
                    Edit Dimension Presets
                </button>
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
        <div class="module-bubble ${module.required ? 'module-required' : ''}" data-module-id="${module.id}" draggable="true">
            <button class="module-btn module-btn-delete" onclick="deleteModule(${module.id})" title="Delete">×</button>
            <div class="module-header">
                <div class="module-title">
                    <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                    ${module.required ? '<span class="required-badge" title="Required field">⚠</span>' : ''}
                    ${module.label}
                </div>
                <div class="module-actions">
                    <button class="module-btn module-btn-required ${module.required ? 'active' : ''}" onclick="toggleRequired(${module.id})" title="${module.required ? 'Mark as optional' : 'Mark as required'}">⚠</button>
                    <button class="module-btn" onclick="openSaveCustomModuleModal(${module.id})" title="Save as Custom">Save</button>
                    ${canMoveUp ? `<button class="module-btn" onclick="moveModule(${module.id}, 'up')" title="Move Up">▲</button>` : ''}
                    ${canMoveDown ? `<button class="module-btn" onclick="moveModule(${module.id}, 'down')" title="Move Down">▼</button>` : ''}
                    <button class="module-btn" onclick="editModuleLabel(${module.id})" title="Edit Label">Edit</button>
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
    // Text inputs - use 'input' for real-time updates
    document.querySelectorAll('.module-input, .module-textarea').forEach(input => {
        input.addEventListener('input', function() {
            updateModuleValue(this);
            updateQuoteRealTime();
        });
    });
    
    // Add blur handler for dimension inputs to convert inches to feet-inches
    document.querySelectorAll('input[data-dimension]').forEach(input => {
        input.addEventListener('blur', function() {
            const converted = convertInchesToFeetInches(this.value.trim());
            if (converted !== this.value.trim()) {
                this.value = converted;
                
                // Update the module value
                const moduleId = parseInt(this.getAttribute('data-module-id'));
                const dimensionType = this.getAttribute('data-dimension');
                const module = modules.find(m => m.id === moduleId);
                
                if (module) {
                    const dims = module.value ? module.value.split('|') : ['', '', ''];
                    const dimIndex = ['width', 'height', 'depth'].indexOf(dimensionType);
                    dims[dimIndex] = converted;
                    module.value = dims.join('|');
                    saveState();
                    updateQuoteRealTime();
                }
            }
        });
    });
    
    // Selects - use 'change' since they don't have continuous input
    document.querySelectorAll('.module-select').forEach(select => {
        select.addEventListener('change', function() {
            updateModuleValue(this);
            updateQuoteRealTime();
        });
    });
    
    // Radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateModuleValue(this);
            updateQuoteRealTime();
        });
    });
    
    // Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateModuleCheckboxValue(this);
            updateQuoteRealTime();
        });
    });
    
    // Drag and drop functionality
    const moduleBubbles = document.querySelectorAll('.module-bubble');
    const container = document.getElementById('modulesContainer');
    
    moduleBubbles.forEach(bubble => {
        // Re-enable draggable on mouseenter (in case it was disabled)
        bubble.addEventListener('mouseenter', function() {
            this.setAttribute('draggable', 'true');
        });
        
        bubble.addEventListener('dragstart', handleDragStart);
        bubble.addEventListener('dragend', handleDragEnd);
        bubble.addEventListener('dragover', handleDragOver);
        bubble.addEventListener('drop', handleDrop);
        bubble.addEventListener('dragenter', handleDragEnter);
        bubble.addEventListener('dragleave', handleDragLeave);
        
        // Add touch event support for mobile/tablet
        bubble.addEventListener('touchstart', handleTouchStart, { passive: true });
        bubble.addEventListener('touchmove', handleTouchMove, { passive: false });
        bubble.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Prevent dragging when interacting with form inputs
        const moduleBody = bubble.querySelector('.module-body');
        if (moduleBody) {
            moduleBody.addEventListener('mousedown', function(e) {
                // Disable draggable when mousedown in module body
                bubble.setAttribute('draggable', 'false');
            });
            
            moduleBody.addEventListener('mouseup', function(e) {
                // Re-enable after a short delay
                setTimeout(() => {
                    bubble.setAttribute('draggable', 'true');
                }, 100);
            });
        }
        
        // Prevent dragging when interacting with form inputs
        const inputs = bubble.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                bubble.setAttribute('draggable', 'false');
            });
            input.addEventListener('mouseup', function(e) {
                setTimeout(() => {
                    bubble.setAttribute('draggable', 'true');
                }, 100);
            });
            input.setAttribute('draggable', 'false');
        });
        
        // Make module-body non-draggable
        if (moduleBody) {
            moduleBody.setAttribute('draggable', 'false');
        }
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
let dragOffsetX = 0;
let dragOffsetY = 0;

function handleDragStart(e) {
    // Prevent dragging if the target is or is within an input/textarea/select
    const target = e.target;
    
    // Check if drag started from an interactive element
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.tagName === 'BUTTON') {
        e.preventDefault();
        this.setAttribute('draggable', 'false');
        return false;
    }
    
    // Check if the target is inside module-body
    if (target.classList.contains('module-body') || target.closest('.module-body')) {
        e.preventDefault();
        this.setAttribute('draggable', 'false');
        return false;
    }
    
    draggedElement = this;
    draggedModuleId = parseInt(this.getAttribute('data-module-id'));
    
    // Calculate offset from mouse position to element's top-left corner
    const rect = this.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    // Create a clone that follows the cursor
    dragClone = this.cloneNode(true);
    dragClone.id = 'drag-clone';
    dragClone.style.position = 'fixed';
    dragClone.style.pointerEvents = 'none';
    dragClone.style.zIndex = '10000';
    dragClone.style.opacity = '0.95';
    dragClone.style.width = this.offsetWidth + 'px';
    dragClone.style.transition = 'none';
    dragClone.style.left = (e.clientX - dragOffsetX) + 'px';
    dragClone.style.top = (e.clientY - dragOffsetY) + 'px';
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
        dragClone.style.left = (e.clientX - dragOffsetX) + 'px';
        dragClone.style.top = (e.clientY - dragOffsetY) + 'px';
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

// Touch event handlers for mobile/tablet drag and drop
let touchDragActive = false;
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

function handleTouchStart(e) {
    const target = e.target;
    
    // Prevent dragging if the target is an interactive element
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.tagName === 'BUTTON') {
        return;
    }
    
    // Check if the target is inside module-body
    if (target.classList.contains('module-body') || target.closest('.module-body')) {
        return;
    }
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;
    
    draggedElement = this;
    draggedModuleId = parseInt(this.getAttribute('data-module-id'));
    
    // Calculate offset
    const rect = this.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    
    // Start a timer to detect long press
    this.touchStartTime = Date.now();
}

function handleTouchMove(e) {
    if (!draggedElement) return;
    
    const touch = e.touches[0];
    const moveX = Math.abs(touch.clientX - touchStartX);
    const moveY = Math.abs(touch.clientY - touchStartY);
    
    // Only start dragging if moved more than 10px (prevents accidental drags)
    if (!touchDragActive && (moveX > 10 || moveY > 10)) {
        // Check if it's been at least 200ms since touch start (helps distinguish drag from scroll)
        const touchDuration = Date.now() - (draggedElement.touchStartTime || 0);
        
        touchDragActive = true;
        touchMoved = true;
        
        // Prevent scrolling once drag is active
        e.preventDefault();
        
        // Create clone
        dragClone = draggedElement.cloneNode(true);
        dragClone.id = 'drag-clone';
        dragClone.style.position = 'fixed';
        dragClone.style.pointerEvents = 'none';
        dragClone.style.zIndex = '10000';
        dragClone.style.opacity = '0.95';
        dragClone.style.width = draggedElement.offsetWidth + 'px';
        dragClone.style.transition = 'none';
        dragClone.style.left = (touch.clientX - dragOffsetX) + 'px';
        dragClone.style.top = (touch.clientY - dragOffsetY) + 'px';
        document.body.appendChild(dragClone);
        
        draggedElement.classList.add('dragging');
        
        // Prevent body scroll while dragging
        document.body.style.overflow = 'hidden';
    }
    
    if (touchDragActive) {
        e.preventDefault();
        
        // Update clone position
        if (dragClone) {
            dragClone.style.left = (touch.clientX - dragOffsetX) + 'px';
            dragClone.style.top = (touch.clientY - dragOffsetY) + 'px';
        }
        
        // Find element under touch
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetBubble = elementBelow?.closest('.module-bubble');
        
        // Remove drag-over from all
        document.querySelectorAll('.module-bubble').forEach(bubble => {
            bubble.classList.remove('drag-over');
        });
        
        if (targetBubble && targetBubble !== draggedElement) {
            targetBubble.classList.add('drag-over');
            
            // Perform swap if different from last
            if (lastDragOverElement !== targetBubble && !swapInProgress) {
                swapInProgress = true;
                lastDragOverElement = targetBubble;
                
                const targetModuleId = parseInt(targetBubble.getAttribute('data-module-id'));
                const draggedIndex = modules.findIndex(m => m.id === draggedModuleId);
                const targetIndex = modules.findIndex(m => m.id === targetModuleId);
                
                if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
                    // Reorder modules array
                    const [draggedModule] = modules.splice(draggedIndex, 1);
                    modules.splice(targetIndex, 0, draggedModule);
                    
                    // Update DOM
                    const container = document.getElementById('modulesContainer');
                    const allBubbles = Array.from(container.querySelectorAll('.module-bubble'));
                    const draggedDOMIndex = allBubbles.indexOf(draggedElement);
                    const targetDOMIndex = allBubbles.indexOf(targetBubble);
                    
                    if (draggedDOMIndex < targetDOMIndex) {
                        targetBubble.parentNode.insertBefore(draggedElement, targetBubble.nextSibling);
                    } else {
                        targetBubble.parentNode.insertBefore(draggedElement, targetBubble);
                    }
                    
                    lastDragOverElement = null;
                    saveState();
                }
                
                setTimeout(() => {
                    swapInProgress = false;
                }, 150);
            }
        }
    }
}

function handleTouchEnd(e) {
    if (!draggedElement) return;
    
    if (touchDragActive) {
        e.preventDefault();
    }
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    
    draggedElement.classList.remove('dragging');
    
    // Remove clone
    if (dragClone) {
        dragClone.remove();
        dragClone = null;
    }
    
    // Remove drag-over classes
    document.querySelectorAll('.module-bubble').forEach(bubble => {
        bubble.classList.remove('drag-over');
    });
    
    draggedElement = null;
    draggedModuleId = null;
    lastDragOverElement = null;
    touchDragActive = false;
    swapInProgress = false;
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

// Dimension Helper Functions
function parseInchesFromValue(value) {
    if (!value) return null;
    
    // Try to parse as pure number first
    const directNumber = parseFloat(value);
    if (!isNaN(directNumber) && !value.includes("'") && !value.includes('"') && !value.includes('-')) {
        return directNumber;
    }
    
    // Parse formats like "3' 0\"" or "3-0" or "36\""
    let totalInches = 0;
    
    // Format: 3' 6" or 3'6"
    const feetInchMatch = value.match(/([\d.]+)'\s*([\d.]+)?"/i);
    if (feetInchMatch) {
        totalInches = parseFloat(feetInchMatch[1]) * 12 + (parseFloat(feetInchMatch[2]) || 0);
        return totalInches;
    }
    
    // Format: 3-6 (feet-inches)
    const dashMatch = value.match(/([\d.]+)-([\d.]+)/);
    if (dashMatch) {
        totalInches = parseFloat(dashMatch[1]) * 12 + parseFloat(dashMatch[2]);
        return totalInches;
    }
    
    // Format: 36" (just inches)
    const inchMatch = value.match(/([\d.]+)"/i);
    if (inchMatch) {
        return parseFloat(inchMatch[1]);
    }
    
    return null;
}

function formatDimensionBoth(value) {
    const inches = parseInchesFromValue(value);
    if (inches === null) return value;
    
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    
    // Format as "36 (3-0)" or "80 (6-8)"
    if (feet === 0) {
        // For small values, show decimal inches with fractional conversion
        return formatDepthWithFraction(inches);
    } else {
        const feetInches = remainingInches === 0 ? `${feet}-0` : `${feet}-${remainingInches}`;
        return `${inches} (${feetInches})`;
    }
}

function formatDepthWithFraction(inches) {
    // Common fractional conversions for door thickness
    const fractions = {
        1.375: '1⅜',
        1.75: '1¾',
        2: '2',
        2.25: '2¼',
        1.5: '1½',
        1.25: '1¼',
        0.75: '¾',
        0.5: '½',
        0.25: '¼'
    };
    
    // Check if we have a common fraction match (with small tolerance)
    for (const [decimal, fraction] of Object.entries(fractions)) {
        if (Math.abs(parseFloat(decimal) - inches) < 0.001) {
            return `${inches} (${fraction})`;
        }
    }
    
    // Otherwise just show inches
    return `${inches}"`;
}

function formatDimensionOption(presetValue) {
    // Parse preset value which may be "value" or "value|description"
    const parts = presetValue.split('|');
    const value = parts[0];
    const description = parts[1] || '';
    
    const formatted = formatDimensionBoth(value);
    return description ? `${formatted} - ${description}` : formatted;
}

function getDimensionValue(presetValue) {
    // Extract just the numeric value from "value|description" format
    return presetValue.split('|')[0];
}

function convertInchesToFeetInches(value) {
    if (!value) return value;
    
    // If already in proper format with feet and inches, don't convert
    if (value.includes("'") && value.includes('"')) {
        return value; // Already formatted like "3' 6""
    }
    
    const inches = parseInchesFromValue(value);
    if (inches === null) return value;
    
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    
    if (feet === 0) {
        return remainingInches > 0 ? `${remainingInches}"` : value;
    } else if (remainingInches === 0) {
        return `${feet}' 0"`;
    } else {
        return `${feet}' ${remainingInches}"`;
    }
}

// Dimension Presets Functions
function updateDimensionFromPreset(moduleId, dimensionType, value) {
    if (value) {
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;
        
        const dims = module.value ? module.value.split('|') : ['', '', ''];
        const dimIndex = ['width', 'height', 'depth'].indexOf(dimensionType);
        dims[dimIndex] = value;
        module.value = dims.join('|');
        
        // Update the text input to match
        const input = document.querySelector(`input[data-module-id="${moduleId}"][data-dimension="${dimensionType}"]`);
        if (input) {
            input.value = value;
        }
        
        saveState();
        updateQuoteRealTime();
    }
}

function editDimensionPresets(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    currentEditingModuleId = moduleId;
    
    // Initialize preset arrays if they don't exist
    if (!module.widthPresets) module.widthPresets = [];
    if (!module.heightPresets) module.heightPresets = [];
    if (!module.depthPresets) module.depthPresets = [];
    
    // Populate the presets lists
    populatePresetList('widthPresetsList', module.widthPresets);
    populatePresetList('heightPresetsList', module.heightPresets);
    populatePresetList('depthPresetsList', module.depthPresets);
    
    openModal('editDimensionPresetsModal');
}

function populatePresetList(listId, presets) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    
    if (presets.length === 0) {
        addPresetField(listId);
    } else {
        presets.forEach(preset => {
            addPresetField(listId, preset);
        });
    }
}

function addPresetField(listId, value = '') {
    const list = document.getElementById(listId);
    const item = document.createElement('div');
    item.className = 'option-editor-item';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-input';
    input.value = value;
    input.placeholder = 'e.g., 2\' 6" or 1¾"';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-option-btn';
    deleteBtn.title = 'Delete';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', function() {
        item.remove();
    });
    
    item.appendChild(input);
    item.appendChild(deleteBtn);
    list.appendChild(item);
    input.focus();
}

function saveDimensionPresets() {
    if (currentEditingModuleId === null) return;
    
    const module = modules.find(m => m.id === currentEditingModuleId);
    if (!module) return;
    
    // Collect all preset values
    const widthInputs = document.querySelectorAll('#widthPresetsList .option-input');
    const heightInputs = document.querySelectorAll('#heightPresetsList .option-input');
    const depthInputs = document.querySelectorAll('#depthPresetsList .option-input');
    
    module.widthPresets = Array.from(widthInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    module.heightPresets = Array.from(heightInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    module.depthPresets = Array.from(depthInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    renderModules();
    saveState();
    closeModal('editDimensionPresetsModal');
    currentEditingModuleId = null;
}

// Preset Management
let activePresetTags = [];

function openPresetModal() {
    activePresetTags = [];
    renderPresets();
    openModal('presetModal');
    
    // Attach search listener
    const searchInput = document.getElementById('presetSearch');
    searchInput.value = '';
    searchInput.addEventListener('input', function() {
        renderPresets(this.value.toLowerCase());
    });
}

function renderPresets(searchTerm = '') {
    const grid = document.getElementById('presetGrid');
    const allPresets = [...builtInPresets, ...customPresets];
    
    // Collect all unique tags
    const allTags = new Set();
    allPresets.forEach(preset => {
        if (preset.tags && preset.tags.length > 0) {
            preset.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Render tag filters
    const tagContainer = document.getElementById('presetTags');
    if (allTags.size > 0) {
        tagContainer.innerHTML = Array.from(allTags).sort().map(tag => 
            `<span class="tag tag-filter ${activePresetTags.includes(tag) ? 'active' : ''}" data-tag="${tag}">${tag}</span>`
        ).join('');
        
        // Attach tag filter listeners
        document.querySelectorAll('#presetTags .tag-filter').forEach(tagEl => {
            tagEl.addEventListener('click', function() {
                const tag = this.getAttribute('data-tag');
                togglePresetTag(tag);
            });
        });
    } else {
        tagContainer.innerHTML = '';
    }
    
    // Filter presets
    let filteredPresets = allPresets;
    
    // Filter by search term
    if (searchTerm) {
        filteredPresets = filteredPresets.filter(preset => {
            const nameMatch = preset.name.toLowerCase().includes(searchTerm);
            const descMatch = preset.description.toLowerCase().includes(searchTerm);
            const tagMatch = preset.tags && preset.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            return nameMatch || descMatch || tagMatch;
        });
    }
    
    // Filter by active tags
    if (activePresetTags.length > 0) {
        filteredPresets = filteredPresets.filter(preset => {
            return preset.tags && activePresetTags.every(activeTag => preset.tags.includes(activeTag));
        });
    }
    
    if (filteredPresets.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No presets found</p>';
    } else {
        grid.innerHTML = filteredPresets.map(preset => createPresetCard(preset)).join('');
    }
    
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
    }, 10);
}

function togglePresetTag(tag) {
    const index = activePresetTags.indexOf(tag);
    if (index > -1) {
        activePresetTags.splice(index, 1);
    } else {
        activePresetTags.push(tag);
    }
    
    const searchTerm = document.getElementById('presetSearch').value.toLowerCase();
    renderPresets(searchTerm);
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
    
    // Trigger real-time quote generation if preset has content
    updateQuoteRealTime();
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
    
    const searchTerm = document.getElementById('presetSearch').value.toLowerCase();
    renderPresets(searchTerm); // Refresh the modal
}

// Real-time quote update
function updateQuoteRealTime() {
    if (modules.length === 0) {
        document.getElementById('outputSection').classList.add('hidden');
        return;
    }
    
    const quoteText = generateQuoteText();
    document.getElementById('quoteOutput').textContent = quoteText;
    document.getElementById('outputSection').classList.remove('hidden');
}

// Generate quote text (extracted for reuse)
function generateQuoteText() {
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
            case 'door-dimension':
            case 'window-dimension':
                const dims = module.value.split('|');
                quoteText += `${module.label}:\n`;
                if (dims[0]) quoteText += `  Width:     ${formatDimensionBoth(dims[0])}\n`;
                if (dims[1]) quoteText += `  Height:    ${formatDimensionBoth(dims[1])}\n`;
                if (dims[2]) quoteText += `  Depth:     ${formatDimensionBoth(dims[2])}\n`;
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
    
    return quoteText;
}

// Quote Generation (manual trigger)
function generateQuote() {
    if (modules.length === 0) {
        alert('Add some modules first!');
        return;
    }
    
    const quoteText = generateQuoteText();
    document.getElementById('quoteOutput').textContent = quoteText;
    document.getElementById('outputSection').classList.remove('hidden');
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyToClipboard() {
    // Check for required fields
    const emptyRequired = modules.filter(m => {
        if (!m.required) return false;
        
        // Skip heading, title, footer as they might be empty by design
        if (m.type === 'heading' || m.type === 'title' || m.type === 'footer') return false;
        
        // Check if value is empty
        return !m.value || m.value.trim() === '';
    });
    
    if (emptyRequired.length > 0) {
        const fieldNames = emptyRequired.map(m => `"${m.label}"`).join(', ');
        alert(`Please fill out the following required fields before copying:\n\n${fieldNames}`);
        
        // Highlight the first empty required field
        const firstEmptyId = emptyRequired[0].id;
        const firstEmptyElement = document.querySelector(`[data-module-id="${firstEmptyId}"]`);
        if (firstEmptyElement) {
            firstEmptyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstEmptyElement.classList.add('highlight-required');
            setTimeout(() => {
                firstEmptyElement.classList.remove('highlight-required');
            }, 2000);
        }
        return;
    }
    
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
    
    // Only add to history if not performing undo/redo
    if (!isUndoRedoAction) {
        // Remove any history after current index (user made a new change after undo)
        history = history.slice(0, historyIndex + 1);
        
        // Add current state to history
        history.push(JSON.parse(JSON.stringify(modules)));
        
        // Limit history to 50 states
        if (history.length > 50) {
            history.shift();
        } else {
            historyIndex++;
        }
        
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn && redoBtn) {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= history.length - 1;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        isUndoRedoAction = true;
        modules = JSON.parse(JSON.stringify(history[historyIndex]));
        renderModules();
        localStorage.setItem('quoteBuilderModules', JSON.stringify(modules));
        isUndoRedoAction = false;
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        isUndoRedoAction = true;
        modules = JSON.parse(JSON.stringify(history[historyIndex]));
        renderModules();
        localStorage.setItem('quoteBuilderModules', JSON.stringify(modules));
        isUndoRedoAction = false;
        updateUndoRedoButtons();
    }
}

// Custom Modules Functions
let activeCustomModuleTags = [];

function openCustomModulesModal() {
    activeCustomModuleTags = [];
    renderCustomModules();
    openModal('customModulesModal');
    
    // Attach search listener
    const searchInput = document.getElementById('customModuleSearch');
    searchInput.value = '';
    searchInput.addEventListener('input', function() {
        renderCustomModules(this.value.toLowerCase());
    });
}

function renderCustomModules(searchTerm = '') {
    const grid = document.getElementById('customModuleGrid');
    
    if (customModules.length === 0) {
        document.getElementById('customModuleTags').innerHTML = '';
        grid.innerHTML = `
            <div class="empty-state-small">
                <p>No custom modules saved</p>
                <p class="tip">Click "Save as Custom" on any module to add it here</p>
            </div>
        `;
        return;
    }
    
    // Collect all unique tags
    const allTags = new Set();
    customModules.forEach(module => {
        if (module.tags && module.tags.length > 0) {
            module.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Render tag filters
    const tagContainer = document.getElementById('customModuleTags');
    if (allTags.size > 0) {
        tagContainer.innerHTML = Array.from(allTags).sort().map(tag => 
            `<span class="tag tag-filter ${activeCustomModuleTags.includes(tag) ? 'active' : ''}" data-tag="${tag}">${tag}</span>`
        ).join('');
        
        // Attach tag filter listeners
        document.querySelectorAll('#customModuleTags .tag-filter').forEach(tagEl => {
            tagEl.addEventListener('click', function() {
                const tag = this.getAttribute('data-tag');
                toggleCustomModuleTag(tag);
            });
        });
    } else {
        tagContainer.innerHTML = '';
    }
    
    // Filter modules
    let filteredModules = customModules;
    
    // Filter by search term
    if (searchTerm) {
        filteredModules = filteredModules.filter((module, index) => {
            const nameMatch = module.name.toLowerCase().includes(searchTerm);
            const typeMatch = module.data.type.toLowerCase().includes(searchTerm);
            const tagMatch = module.tags && module.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            return nameMatch || typeMatch || tagMatch;
        });
    }
    
    // Filter by active tags
    if (activeCustomModuleTags.length > 0) {
        filteredModules = filteredModules.filter(module => {
            return module.tags && activeCustomModuleTags.every(activeTag => module.tags.includes(activeTag));
        });
    }
    
    if (filteredModules.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No modules found</p>';
        return;
    }
    
    // Get original indices for the filtered modules
    grid.innerHTML = filteredModules.map(module => {
        const originalIndex = customModules.indexOf(module);
        return `
            <div class="custom-module-card" onclick="addCustomModule(${originalIndex})">
                <button class="custom-module-delete" onclick="event.stopPropagation(); deleteCustomModule(${originalIndex})" title="Delete">×</button>
                <h3>${module.name}</h3>
                <p class="module-type">${getModuleIcon(module.data.type)} ${capitalizeFirst(module.data.type)}</p>
                ${module.tags && module.tags.length > 0 ? `
                    <div class="tag-container">
                        ${module.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function toggleCustomModuleTag(tag) {
    const index = activeCustomModuleTags.indexOf(tag);
    if (index > -1) {
        activeCustomModuleTags.splice(index, 1);
    } else {
        activeCustomModuleTags.push(tag);
    }
    
    const searchTerm = document.getElementById('customModuleSearch').value.toLowerCase();
    renderCustomModules(searchTerm);
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
        const searchTerm = document.getElementById('customModuleSearch').value.toLowerCase();
        renderCustomModules(searchTerm);
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
}

// Banner Image Functions
function handlePasteImage(e) {
    // Only handle paste when banner settings modal is open
    const modal = document.getElementById('bannerSettingsModal');
    if (modal.classList.contains('hidden')) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = items[i].getAsFile();
            
            // Validate file size (max 5MB)
            if (blob.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageData = event.target.result;
                
                // Save to localStorage
                localStorage.setItem('bannerImage', imageData);
                
                // Update display
                displayBannerImage(imageData);
                
                // Show preview in modal
                const preview = document.getElementById('bannerPreview');
                const previewImg = document.getElementById('bannerPreviewImg');
                previewImg.src = imageData;
                preview.classList.remove('hidden');
            };
            
            reader.readAsDataURL(blob);
            break;
        }
    }
}

function handleBannerImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        
        // Save to localStorage
        localStorage.setItem('bannerImage', imageData);
        
        // Update display
        displayBannerImage(imageData);
        
        // Show preview in modal
        const preview = document.getElementById('bannerPreview');
        const previewImg = document.getElementById('bannerPreviewImg');
        previewImg.src = imageData;
        preview.classList.remove('hidden');
    };
    
    reader.readAsDataURL(file);
}

function displayBannerImage(imageData) {
    const bannerDiv = document.getElementById('bannerImage');
    bannerDiv.style.backgroundImage = `url(${imageData})`;
    bannerDiv.classList.remove('hidden');
    
    // Add has-banner class to hide title
    const headerContent = document.querySelector('.header-content');
    headerContent.classList.add('has-banner');
}

function loadBannerImage() {
    const savedBanner = localStorage.getItem('bannerImage');
    if (savedBanner) {
        displayBannerImage(savedBanner);
        
        // Show preview in modal if modal is open
        const previewImg = document.getElementById('bannerPreviewImg');
        if (previewImg) {
            previewImg.src = savedBanner;
            document.getElementById('bannerPreview').classList.remove('hidden');
        }
    }
}

function removeBannerImage() {
    if (confirm('Remove banner image?')) {
        localStorage.removeItem('bannerImage');
        
        const bannerDiv = document.getElementById('bannerImage');
        bannerDiv.style.backgroundImage = '';
        bannerDiv.classList.add('hidden');
        
        // Remove has-banner class to show title
        const headerContent = document.querySelector('.header-content');
        headerContent.classList.remove('has-banner');
        
        const preview = document.getElementById('bannerPreview');
        preview.classList.add('hidden');
        
        const input = document.getElementById('bannerImageInput');
        input.value = '';
    }
}

// Make functions globally accessible
window.deleteModule = deleteModule;
window.editModuleLabel = editModuleLabel;
window.moveModule = moveModule;
window.editOptions = editOptions;
window.openSaveCustomModuleModal = openSaveCustomModuleModal;
window.addCustomModule = addCustomModule;
window.deleteCustomModule = deleteCustomModule;
window.toggleRequired = toggleRequired;
window.editDimensionPresets = editDimensionPresets;
window.updateDimensionFromPreset = updateDimensionFromPreset;
