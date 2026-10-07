const SUPABASE_URL = "https://msdzqocpnivulabxbxnw.supabase.co";
const SUPABASE_KEY = "sb_publishable_6FuT27VhGSnG4nsOhtFvFg_JrGjCVV8";
const STORE_WHATSAPP_NUMBER = '5514996774289';
const cartItemsKey = 'gm-modas-cart-v1';

const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const SUPABASE_BUCKET = "Produtos";

async function carregarProdutosSupabase() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from("produtos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao carregar produtos:", error);
        return;
    }

    customProducts = (data || []).map(produto => ({
        id: produto.id,
        name: produto.nome,
        price: Number(produto.preço),
        category: produto.categoria,
        quantity: Number(produto.estoque),
        image: produto.imagem || "",
        images: produto.imagem ? [produto.imagem] : []
    }));

    renderAllProducts();
}


if (window.lucide) lucide.createIcons();

const menuButton = document.querySelector('.menu-toggle');
const links = document.querySelector('.links');
menuButton.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', isOpen);
});

const settingsWrapper = document.querySelector('.settings-wrapper');
const settingsToggle = document.querySelector('.settings-toggle');
const settingsMenu = document.querySelector('.settings-menu');
const adminModeToggle = document.querySelector('.admin-mode-toggle');
const adminModeState = document.querySelector('.admin-mode-state');
const adminAddButton = document.querySelector('.admin-add-button');
const coverEditControls = document.querySelectorAll('.cover-edit-button');
const coverFileInputs = document.querySelectorAll('.cover-file-input');
const productForm = document.querySelector('#product-form');
const productFormTitle = document.querySelector('.product-form-heading strong');
const productSubmitButton = productForm.querySelector('button[type="submit"]');
const productDeleteButton = document.querySelector('.delete-product-button');
const productGrid = document.querySelector('.products');
const cartPage = document.querySelector('.cart-page');
const cartPageList = document.querySelector('.cart-page-list');
const cartPageEmpty = document.querySelector('.cart-page-empty');
const cartPageItemCount = document.querySelector('.cart-page-item-count');
const cartPageSummary = document.querySelector('.cart-page-summary');
const cartPageTotal = document.querySelector('.cart-page-total');
const searchToggle = document.querySelector('.search-toggle');
const searchDialog = document.querySelector('.search-dialog');
const searchInput = document.querySelector('.search-input');
const searchResultsCount = document.querySelector('.search-results-count');
const searchResults = document.querySelector('.search-results');
const searchEmpty = document.querySelector('.search-empty');
const purchaseDialog = document.querySelector('.purchase-dialog');
const purchaseCartAddButton = document.querySelector('.purchase-cart-add-button');
const cartButton = document.querySelector('[aria-label="Sacola de compras"]');
const cartCount = document.querySelector('.bag-count');
const cartToast = document.querySelector('.cart-toast');
const purchaseImage = document.querySelector('#purchase-image');
const purchaseImageCounter = document.querySelector('#purchase-image-counter');
const purchaseGalleryPrevious = document.querySelector('.purchase-gallery-previous');
const purchaseGalleryNext = document.querySelector('.purchase-gallery-next');
const purchaseCategory = document.querySelector('#purchase-category');
const purchaseTitle = document.querySelector('#purchase-title');
const purchasePrice = document.querySelector('#purchase-price');
const purchaseSize = document.querySelector('#purchase-size');
const purchaseQuantity = document.querySelector('#purchase-quantity');
const purchaseStatus = document.querySelector('.purchase-status');
const productImageInput = document.querySelector('#product-image');
const productPreviewImages = document.querySelector('#product-preview-images');
const productPreviewName = document.querySelector('#product-preview-name');
const productFormStatus = document.querySelector('.product-form-status');
const emptyCatalog = document.querySelector('.empty-catalog');
const categoriesGrid = document.querySelector('.categories');
const categoryDetail = document.querySelector('.category-detail');
const categoryDetailTitle = document.querySelector('#category-detail-title');
const categoryProductsGrid = document.querySelector('.category-products');
const categoryEmpty = document.querySelector('.category-empty');
const uploadFeedback = document.querySelector('.upload-feedback');
const customProductsKey = 'gm-modas-custom-products-v1';
const adminModeKey = 'gm-modas-admin-mode-v1';
const coversKey = 'gm-modas-covers-v1';
const coverKeys = ['hero', 'category-vestidos', 'category-blusas', 'category-calcas', 'category-conjuntos', 'editorial'];
let customProducts = [];
let savedCovers = {};
let isAdminMode = false;
let activeCategory = null;
let uploadFeedbackTimeout;
const coverObjectUrls = new Map();
let activePurchaseImages = [];
let activePurchaseImageIndex = 0;
let productPreviewObjectUrls = [];
let selectedProductFiles = [];
let editingProductId = null;
let previousStoreHash = '#inicio';
let cartItems = [];
let activePurchaseProduct = null;
let cartToastTimeout;

try {
    const storedProducts = JSON.parse(localStorage.getItem(customProductsKey) || '[]');
    if (Array.isArray(storedProducts)) customProducts = storedProducts;
    const storedCartItems = JSON.parse(localStorage.getItem(cartItemsKey) || '[]');
    if (Array.isArray(storedCartItems)) cartItems = storedCartItems;
    const storedCovers = JSON.parse(localStorage.getItem(coversKey) || '{}');
    if (storedCovers && typeof storedCovers === 'object' && !Array.isArray(storedCovers)) savedCovers = storedCovers;
    isAdminMode = localStorage.getItem(adminModeKey) === 'true';
} catch {
    productFormStatus.textContent = 'Não foi possível ler os produtos salvos neste navegador.';
}

function updateCartCount() {
    const count = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    cartCount.textContent = String(count);
    cartButton.setAttribute('aria-label', `Sacola de compras, ${count} ${count === 1 ? 'produto' : 'produtos'}`);
}

function renderCartPage() {
    cartPageList.replaceChildren();
    const itemCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    cartPageItemCount.textContent = `${itemCount} ${itemCount === 1 ? 'produto' : 'produtos'}`;
    cartPageEmpty.hidden = cartItems.length > 0;
    cartPageSummary.hidden = cartItems.length === 0;
    cartPageTotal.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    cartItems.forEach((item) => {
        const row = document.createElement('article');
        row.className = 'cart-line';
        const image = document.createElement('img');
        image.className = 'cart-line-image';
        image.src = item.image || '';
        image.alt = item.name;

        const details = document.createElement('div');
        details.className = 'cart-line-details';
        const name = document.createElement('h3');
        name.textContent = item.name;
        const category = document.createElement('p');
        category.className = 'cart-line-category';
        category.textContent = `${item.category || 'Peça'}${item.size ? ` · ${item.size}` : ''}`;
        const unitPrice = document.createElement('p');
        unitPrice.className = 'cart-line-price';
        unitPrice.textContent = `${Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} cada`;
        const quantity = document.createElement('span');
        quantity.className = 'cart-line-quantity';
        quantity.textContent = `Quantidade: ${item.quantity}`;
        details.append(name, category, unitPrice, quantity);

        const actions = document.createElement('div');
        actions.className = 'cart-line-actions';
        const optionsButton = document.createElement('button');
        optionsButton.className = 'primary-button cart-options-toggle';
        optionsButton.type = 'button';
        optionsButton.textContent = 'Ver opções de compra';
        optionsButton.setAttribute('aria-expanded', 'false');
        const paymentPanel = document.createElement('div');
        paymentPanel.className = 'cart-payment-panel';
        paymentPanel.hidden = true;
        const paymentOptions = document.createElement('div');
        paymentOptions.className = 'payment-options cart-payment-options';
        const paymentStatus = document.createElement('p');
        paymentStatus.className = 'cart-payment-status';
        paymentStatus.setAttribute('role', 'status');
        paymentStatus.setAttribute('aria-live', 'polite');

        const methods = [
            { id: 'pix', label: 'Pix', detail: 'Pagamento instantâneo', icon: 'qr-code' },
            { id: 'whatsapp', label: 'WhatsApp', detail: 'Converse para fazer seu pedido', icon: 'message-circle' },
            { id: 'card', label: 'Cartão', detail: 'Crédito ou débito', icon: 'credit-card' }
        ];
        methods.forEach((method) => {
            const option = document.createElement('button');
            option.className = 'payment-option';
            option.type = 'button';
            option.innerHTML = `<i data-lucide="${method.icon}"></i><span><strong>${method.label}</strong><small>${method.detail}</small></span><i class="payment-arrow" data-lucide="arrow-up-right"></i>`;
            option.addEventListener('click', () => {
                if (method.id === 'whatsapp') {
                    const message = [
                        'Olá! Quero continuar a compra desta peça:',
                        `Peça: ${item.name}`,
                        `Categoria: ${item.category || 'Peça'}`,
                        `Preço: ${Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                        `Quantidade: ${item.quantity}`
                    ].join('\n');
                    window.open(`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
                    paymentStatus.textContent = 'Abrindo sua conversa com a loja no WhatsApp.';
                } else {
                    paymentStatus.textContent = `Pagamento por ${method.label} ainda não está conectado.`;
                }
            });
            paymentOptions.append(option);
        });
        paymentPanel.append(paymentOptions, paymentStatus);
        optionsButton.addEventListener('click', () => {
            paymentPanel.hidden = !paymentPanel.hidden;
            optionsButton.setAttribute('aria-expanded', String(!paymentPanel.hidden));
            if (window.lucide) lucide.createIcons();
        });

        const removeButton = document.createElement('button');
        removeButton.className = 'cart-remove-button';
        removeButton.type = 'button';
        removeButton.setAttribute('aria-label', `Remover ${item.name} da sacola`);
        removeButton.innerHTML = '<i data-lucide="trash-2"></i><span>Remover</span>';
        removeButton.addEventListener('click', () => {
            const updatedCart = cartItems.filter((cartItem) => cartItem.productId !== item.productId);
            try {
                localStorage.setItem(cartItemsKey, JSON.stringify(updatedCart));
                cartItems = updatedCart;
                updateCartCount();
                renderCartPage();
            } catch {
                paymentStatus.textContent = 'Não foi possível remover este produto da sacola.';
            }
        });
        actions.append(optionsButton, removeButton);

        row.append(image, details, actions, paymentPanel);
        cartPageList.append(row);
    });

    if (window.lucide) lucide.createIcons();
}

function addProductToCart(product) {
    if (!product) return;
    if (Number(product.quantity) < 1) {
        showCartToast('Esta peça está sem estoque.');
        return;
    }
    const existingItem = cartItems.find((item) => item.productId === product.id);
    const cartItem = existingItem
        ? { ...existingItem, quantity: existingItem.quantity + 1 }
        : {
            productId: product.id,
            name: product.name,
            category: product.category,
            price: Number(product.price),
            size: product.size || 'Não informado',
            image: getProductImages(product)[0],
            quantity: 1
        };
    const updatedCart = existingItem
        ? cartItems.map((item) => item.productId === cartItem.productId ? cartItem : item)
        : [...cartItems, cartItem];
    try {
        localStorage.setItem(cartItemsKey, JSON.stringify(updatedCart));
        cartItems = updatedCart;
        updateCartCount();
        showCartToast();
    } catch {
        showCartToast('Não foi possível adicionar à sacola.');
    }
}

function showCartToast(message = 'Produto adicionado ao carrinho!') {
    clearTimeout(cartToastTimeout);
    const toastParent = purchaseDialog.open ? purchaseDialog : document.body;
    if (cartToast.parentElement !== toastParent) toastParent.append(cartToast);
    cartToast.classList.toggle('cart-toast-in-dialog', purchaseDialog.open);
    cartToast.querySelector('span:last-child').textContent = message;
    cartToast.hidden = false;
    if (window.lucide) lucide.createIcons();
    cartToastTimeout = setTimeout(() => {
        cartToast.hidden = true;
    }, 3500);
}

updateCartCount();

function resetProductForm(statusMessage = 'Salvo somente neste navegador.') {
    editingProductId = null;
    selectedProductFiles = [];
    productForm.reset();
    productImageInput.value = '';
    clearProductPreviews();
    productPreviewName.textContent = 'As fotos selecionadas aparecerão aqui.';
    productFormTitle.textContent = 'Nova peça';
    productSubmitButton.innerHTML = 'Salvar peça <i data-lucide="check"></i>';
    productDeleteButton.hidden = true;
    productFormStatus.textContent = statusMessage;
    if (window.lucide) lucide.createIcons();
}

function setAdminMode(enabled) {
    isAdminMode = enabled;
    document.body.classList.toggle('admin-mode', enabled);
    adminModeToggle.setAttribute('aria-pressed', String(enabled));
    adminModeState.textContent = enabled ? 'Ativado' : 'Desativado';
    adminAddButton.hidden = !enabled;
    coverEditControls.forEach((control) => {
        control.hidden = !enabled;
    });
    document.querySelectorAll('.remove-product').forEach((button) => {
        button.hidden = !enabled;
    });
    if (!enabled) {
        productForm.hidden = true;
        resetProductForm();
    }
    try {
        localStorage.setItem(adminModeKey, String(enabled));
    } catch {
        productFormStatus.textContent = 'Não foi possível salvar essa configuração neste navegador.';
    }
}

function openProductForm() {
    if (!isAdminMode) return;
    if (activeCategory) showHome();
    resetProductForm();
    productForm.hidden = false;
    productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    requestAnimationFrame(() => productForm.elements.name.focus({ preventScroll: true }));
}

function openProductEditor(product) {
    if (!isAdminMode) return;
    if (searchDialog.open) searchDialog.close();
    if (activeCategory) showHome();
    resetProductForm();
    editingProductId = product.id;
    productForm.elements.name.value = product.name;
    productForm.elements.price.value = product.price;
    productForm.elements.category.value = product.category;
    productForm.elements.size.value = product.size || '';
    productForm.elements.quantity.value = product.quantity ?? '';
    productFormTitle.textContent = 'Editar peça';
    productSubmitButton.innerHTML = 'Salvar alterações <i data-lucide="check"></i>';
    const currentImages = getProductImages(product);
    currentImages.forEach((source, index) => {
        const preview = document.createElement('img');
        preview.src = source;
        preview.alt = `Foto atual ${index + 1} de ${product.name}`;
        productPreviewImages.append(preview);
    });
    productPreviewName.textContent = `${currentImages.length} fotos atuais`;
    productDeleteButton.hidden = false;
    productFormStatus.textContent = 'As fotos atuais serão mantidas se você não escolher outras.';
    productForm.hidden = false;
    if (window.lucide) lucide.createIcons();
    productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    requestAnimationFrame(() => productForm.elements.name.focus({ preventScroll: true }));
}

function applyCover(key, source) {
    const image = document.querySelector(`[data-cover-image="${key}"]`);
    if (!image) return;
    const previousUrl = coverObjectUrls.get(key);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    if (source.startsWith('blob:')) coverObjectUrls.set(key, source);
    else coverObjectUrls.delete(key);
    image.src = source;
    image.hidden = false;
    image.parentElement.classList.add('has-cover');
    const placeholder = image.parentElement.querySelector('.category-placeholder, .editorial-placeholder');
    if (placeholder) placeholder.hidden = true;
}

function resetCover(key) {
    const image = document.querySelector(`[data-cover-image="${key}"]`);
    if (!image) return;
    const previousUrl = coverObjectUrls.get(key);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    coverObjectUrls.delete(key);
    image.removeAttribute('src'); 
    image.hidden = true;
    image.parentElement.classList.remove('has-cover');
    const placeholder = image.parentElement.querySelector('.category-placeholder, .editorial-placeholder');
    if (placeholder) placeholder.hidden = false;
}

function showUploadFeedback(message, isError = false) {
    clearTimeout(uploadFeedbackTimeout);
    uploadFeedback.textContent = message;
    uploadFeedback.dataset.state = isError ? 'error' : 'success';
    uploadFeedback.hidden = false;
    if (!isError) uploadFeedbackTimeout = setTimeout(() => {
        uploadFeedback.hidden = true;
    }, 6000);
}

function openCoverDatabase() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('Este navegador não permite salvar capas.'));
            return;
        }
        const request = indexedDB.open('gm-modas-cover-storage', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('covers');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Não foi possível abrir o armazenamento de capas.'));
    });
}

async function readStoredCover(key) {
    const database = await openCoverDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction('covers', 'readonly');
        const request = transaction.objectStore('covers').get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Não foi possível ler a capa salva.'));
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
            database.close();
            reject(transaction.error || new Error('Não foi possível ler a capa salva.'));
        };
    });
}

async function storeCover(key, blob) {
    const database = await openCoverDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction('covers', 'readwrite');
        transaction.objectStore('covers').put(blob, key);
        transaction.oncomplete = () => {
            database.close();
            resolve();
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error || new Error('Não foi possível salvar a capa.'));
        };
        transaction.onabort = () => {
            database.close();
            reject(transaction.error || new Error('O navegador cancelou o salvamento da capa.'));
        };
    });
}

async function loadSavedCovers() {
    try {
        for (const [key, source] of Object.entries(savedCovers)) {
            if (typeof source !== 'string' || !source.startsWith('data:')) continue;
            if (await readStoredCover(key)) continue;
            const response = await fetch(source);
            await storeCover(key, await response.blob());
        }
        for (const key of coverKeys) {
            const blob = await readStoredCover(key);
            if (blob) applyCover(key, URL.createObjectURL(blob));
            else if (savedCovers[key]) applyCover(key, savedCovers[key]);
        }
        if (Object.keys(savedCovers).length) {
            localStorage.removeItem(coversKey);
            savedCovers = {};
        }
    } catch (error) {
        Object.entries(savedCovers).forEach(([key, source]) => applyCover(key, source));
        showUploadFeedback(error.message || 'Não foi possível carregar as capas salvas.', true);
    }
}

setAdminMode(isAdminMode);
const coversReady = loadSavedCovers();

function closeSettingsMenu() {
    settingsMenu.hidden = true;
    settingsToggle.setAttribute('aria-expanded', 'false');
}

settingsToggle.addEventListener('click', () => {
    const isExpanded = settingsToggle.getAttribute('aria-expanded') === 'true';
    settingsToggle.setAttribute('aria-expanded', String(!isExpanded));
    settingsMenu.hidden = isExpanded;
});

adminModeToggle.addEventListener('click', () => {
    setAdminMode(!isAdminMode);
    closeSettingsMenu();
});

adminAddButton.addEventListener('click', () => {
    openProductForm();
});

cartButton.addEventListener('click', () => showCartPage());
document.querySelector('.cart-page-back').addEventListener('click', returnToStore);

document.addEventListener('click', (event) => {
    if (!settingsWrapper.contains(event.target)) closeSettingsMenu();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !settingsMenu.hidden) {
        closeSettingsMenu();
        settingsToggle.focus();
    }
});

function updateEmptyStates() {
    emptyCatalog.hidden = productGrid.querySelector('.product') !== null;
    categoryEmpty.hidden = categoryProductsGrid.querySelector('.product') !== null;
}

function getProductImages(product) {
    const images = Array.isArray(product.images)
        ? product.images.filter((image) => typeof image === 'string' && image.length > 0)
        : [];
    if (images.length) return images;
    return typeof product.image === 'string' && product.image ? [product.image] : [];
}

function updatePurchaseImage() {
    purchaseImage.src = activePurchaseImages[activePurchaseImageIndex];
    purchaseImageCounter.textContent = `${activePurchaseImageIndex + 1} / ${activePurchaseImages.length}`;
}

function movePurchaseImage(direction) {
    if (activePurchaseImages.length < 2) return;
    activePurchaseImageIndex = (activePurchaseImageIndex + direction + activePurchaseImages.length) % activePurchaseImages.length;
    updatePurchaseImage();
}

function openPurchaseDialog(product, imageIndex = 0) {
    if (searchDialog.open) searchDialog.close();
    activePurchaseProduct = product;
    activePurchaseImages = getProductImages(product);
    activePurchaseImageIndex = Math.min(imageIndex, activePurchaseImages.length - 1);
    updatePurchaseImage();
    purchaseImage.alt = product.name;
    purchaseGalleryPrevious.hidden = activePurchaseImages.length < 2;
    purchaseGalleryNext.hidden = activePurchaseImages.length < 2;
    purchaseImageCounter.hidden = activePurchaseImages.length < 2;
    purchaseCategory.textContent = product.category;
    purchaseTitle.textContent = product.name;
    purchasePrice.textContent = Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    purchaseSize.textContent = product.size || 'Não informado';
    purchaseQuantity.textContent = product.quantity === undefined || product.quantity === null || product.quantity === ''
        ? 'Não informado'
        : `${product.quantity} ${Number(product.quantity) === 1 ? 'peça' : 'peças'}`;
    document.querySelectorAll('.payment-option').forEach((option) => option.setAttribute('aria-pressed', 'false'));
    purchaseStatus.textContent = 'Prévia visual: nenhuma compra ou cobrança será realizada.';
    purchaseDialog.showModal();
    if (window.lucide) lucide.createIcons();
}

function renderCustomProduct(product, container = productGrid) {
    const card = document.createElement('article');
    card.className = 'product';
    card.dataset.productId = product.id;
    const imageFrame = document.createElement('div');
    imageFrame.className = 'product-image';
    const images = getProductImages(product);
    let activeImageIndex = 0;
    const image = document.createElement('img');
    image.src = images[0] || product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    const imageOpenButton = document.createElement('button');
    imageOpenButton.className = 'product-image-open';
    imageOpenButton.type = 'button';
    imageOpenButton.setAttribute('aria-label', `Ver opções de compra para ${product.name}`);
    imageOpenButton.addEventListener('click', () => openPurchaseDialog(product, activeImageIndex));
    imageOpenButton.append(image);
    const previousPhotoButton = document.createElement('button');
    previousPhotoButton.className = 'gallery-arrow card-gallery-previous';
    previousPhotoButton.type = 'button';
    previousPhotoButton.setAttribute('aria-label', `Foto anterior de ${product.name}`);
    previousPhotoButton.hidden = images.length < 2;
    previousPhotoButton.innerHTML = '<i data-lucide="chevron-left"></i>';
    const nextPhotoButton = document.createElement('button');
    nextPhotoButton.className = 'gallery-arrow card-gallery-next';
    nextPhotoButton.type = 'button';
    nextPhotoButton.setAttribute('aria-label', `Próxima foto de ${product.name}`);
    nextPhotoButton.hidden = images.length < 2;
    nextPhotoButton.innerHTML = '<i data-lucide="chevron-right"></i>';
    const cardImageCounter = document.createElement('span');
    cardImageCounter.className = 'gallery-counter card-gallery-counter';
    cardImageCounter.setAttribute('aria-live', 'polite');
    cardImageCounter.hidden = images.length < 2;
    cardImageCounter.textContent = `1 / ${images.length}`;
    previousPhotoButton.addEventListener('click', (event) => {
        event.stopPropagation();
        activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
        image.src = images[activeImageIndex];
        cardImageCounter.textContent = `${activeImageIndex + 1} / ${images.length}`;
    });
    nextPhotoButton.addEventListener('click', (event) => {
        event.stopPropagation();
        activeImageIndex = (activeImageIndex + 1) % images.length;
        image.src = images[activeImageIndex];
        cardImageCounter.textContent = `${activeImageIndex + 1} / ${images.length}`;
    });
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = product.category;
    const editButton = document.createElement('button');
    editButton.className = 'remove-product edit-product';
    editButton.type = 'button';
    editButton.hidden = !isAdminMode;
    editButton.setAttribute('aria-label', `Editar ${product.name}`);
    editButton.title = 'Editar peça';
    editButton.innerHTML = '<i data-lucide="pencil" size="16"></i>';
    editButton.addEventListener('click', () => openProductEditor(product));
    imageFrame.append(imageOpenButton, previousPhotoButton, nextPhotoButton, cardImageCounter, tag, editButton);
    const info = document.createElement('div');
    info.className = 'product-info';
    const name = document.createElement('h3');
    name.textContent = product.name;
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const purchaseButton = document.createElement('button');
    purchaseButton.className = 'purchase-button';
    purchaseButton.type = 'button';
    purchaseButton.textContent = 'Ver opções de compra';
    purchaseButton.addEventListener('click', () => openPurchaseDialog(product));
    info.append(name, price, purchaseButton);
    card.append(imageFrame, info);
    container.append(card);
    updateEmptyStates();
    if (window.lucide) lucide.createIcons();
}

customProducts.forEach((product) => renderCustomProduct(product));

function renderAllProducts() {
    productGrid.querySelectorAll('.product[data-product-id]').forEach((card) => card.remove());
    categoryProductsGrid.querySelectorAll('.product').forEach((card) => card.remove());
    customProducts.forEach((product) => renderCustomProduct(product));
    if (activeCategory) {
        customProducts
            .filter((product) => product.category === activeCategory)
            .forEach((product) => renderCustomProduct(product, categoryProductsGrid));
    }
    updateEmptyStates();
}

function normalizeSearchText(value) {
    return String(value || '').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function renderSearchResults() {
    const query = normalizeSearchText(searchInput.value);
    const matches = customProducts.filter((product) => {
        const searchableFields = [product.name, product.category, product.size].map(normalizeSearchText);
        return !query || searchableFields.some((field) => field.includes(query));
    });
    searchResults.replaceChildren();
    matches.forEach((product) => renderCustomProduct(product, searchResults));
    searchResults.hidden = matches.length === 0;
    searchEmpty.hidden = matches.length > 0;
    searchResultsCount.textContent = `${matches.length} ${matches.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
}

searchToggle.addEventListener('click', () => {
    searchInput.value = '';
    renderSearchResults();
    searchDialog.showModal();
    requestAnimationFrame(() => searchInput.focus({ preventScroll: true }));
});
searchInput.addEventListener('input', renderSearchResults);
document.querySelector('.search-close').addEventListener('click', () => searchDialog.close());
searchDialog.addEventListener('click', (event) => {
    if (event.target === searchDialog) searchDialog.close();
});

function categorySlug(category) {
    return category.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
}

function showCategory(category) {
    activeCategory = category;
    categoryDetailTitle.textContent = category;
    categoryProductsGrid.querySelectorAll('.product').forEach((card) => card.remove());
    const matchingProducts = customProducts.filter((product) => product.category === category);
    categoryEmpty.hidden = matchingProducts.length > 0;
    matchingProducts.forEach((product) => renderCustomProduct(product, categoryProductsGrid));
    categoryDetail.hidden = false;
    document.body.classList.add('category-view-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHome(updateHistory = true) {
    activeCategory = null;
    categoryDetail.hidden = true;
    cartPage.hidden = true;
    document.body.classList.remove('cart-view-active');
    document.body.classList.remove('category-view-active');
    if (updateHistory && window.location.hash !== '#colecoes') window.location.hash = '#colecoes';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCartPage(updateHistory = true) {
    if (!document.body.classList.contains('cart-view-active') && window.location.hash !== '#carrinho') {
        previousStoreHash = window.location.hash || '#inicio';
    }
    categoryDetail.hidden = true;
    cartPage.hidden = false;
    document.body.classList.add('cart-view-active');
    renderCartPage();
    if (updateHistory && window.location.hash !== '#carrinho') window.location.hash = '#carrinho';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function returnToStore() {
    cartPage.hidden = true;
    document.body.classList.remove('cart-view-active');
    window.location.hash = previousStoreHash === '#carrinho' ? '#inicio' : previousStoreHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function categoryFromHash() {
    const match = window.location.hash.match(/^#categoria\/([^/]+)$/);
    if (!match) return null;
    const categoryLink = [...categoriesGrid.querySelectorAll('.category')].find((link) => categorySlug(link.dataset.category) === match[1]);
    return categoryLink?.dataset.category || null;
}

document.querySelector('.back-to-categories').addEventListener('click', () => showHome());

document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && !anchor.matches('.category') && document.body.classList.contains('category-view-active')) showHome(false);
});

window.addEventListener('hashchange', () => {
    if (window.location.hash === '#carrinho') {
        showCartPage(false);
        return;
    }
    cartPage.hidden = true;
    document.body.classList.remove('cart-view-active');
    const category = categoryFromHash();
    if (category) showCategory(category);
    else if (document.body.classList.contains('category-view-active')) showHome(false);
});

if (window.location.hash === '#carrinho') showCartPage(false);
else {
    const initialCategory = categoryFromHash();
    if (initialCategory) showCategory(initialCategory);
}

coverFileInputs.forEach((input) => {
    input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        if (!isAdminMode) {
            input.value = '';
            return;
        }
        if (!file.type.startsWith('image/')) {
            productFormStatus.textContent = 'Selecione um arquivo de imagem válido.';
            showUploadFeedback('Escolha um arquivo de imagem válido.', true);
            input.value = '';
            return;
        }
        if (file.size > 30 * 1024 * 1024) {
            productFormStatus.textContent = 'A imagem da capa deve ter no máximo 30 MB.';
            showUploadFeedback('A imagem da capa deve ter no máximo 30 MB.', true);
            input.value = '';
            return;
        }
        const coverKey = input.dataset.coverInput;
        let previousCover = null;
        productFormStatus.textContent = 'Preparando a nova capa...';
        showUploadFeedback('Aplicando a nova capa...');
        const previousCoverPromise = coversReady.then(() => readStoredCover(coverKey)).catch(() => null);
        applyCover(coverKey, URL.createObjectURL(file));
        try {
            await coversReady;
            previousCover = await previousCoverPromise;
            const source = await compressImage(file, 1800, 0.82);
            const blob = await (await fetch(source)).blob();
            await storeCover(coverKey, blob);
            savedCovers = { ...savedCovers };
            delete savedCovers[coverKey];
            if (Object.keys(savedCovers).length) localStorage.setItem(coversKey, JSON.stringify(savedCovers));
            else localStorage.removeItem(coversKey);
            applyCover(coverKey, URL.createObjectURL(blob));
            productFormStatus.textContent = 'Capa substituída com sucesso.';
            showUploadFeedback('Capa substituída com sucesso.');
        } catch (error) {
            if (previousCover) applyCover(coverKey, URL.createObjectURL(previousCover));
            else if (savedCovers[coverKey]) applyCover(coverKey, savedCovers[coverKey]);
            else resetCover(coverKey);
            productFormStatus.textContent = error.message || 'Não foi possível salvar a capa.';
            showUploadFeedback(error.message || 'Não foi possível substituir a capa.', true);
        } finally {
            input.value = '';
        }
    });
});

document.querySelector('.close-product-form').addEventListener('click', () => {
    productForm.hidden = true;
    resetProductForm();
});

productDeleteButton.addEventListener('click', async () => {
    if (!isAdminMode || !editingProductId) return;
    const product = customProducts.find((item) => item.id === editingProductId);
    if (!product || !window.confirm(`Excluir ${product.name} do catálogo?`)) return;
    const remainingProducts = customProducts.filter((item) => item.id !== product.id);
    try {
        const { error } = await supabaseClient
        .from('produtos')
        .delete()
        .eq('id', product.id);

    if (error) throw error;

    customProducts = remainingProducts;
    renderAllProducts();
    productForm.hidden = true;
    resetProductForm();
    showUploadFeedback('Peça excluída do catálogo.');
    } catch (error) {
        productFormStatus.textContent = 'Não foi possível excluir a peça.';
    }
});

document.querySelector('.purchase-close').addEventListener('click', () => purchaseDialog.close());
purchaseCartAddButton.addEventListener('click', () => addProductToCart(activePurchaseProduct));
purchaseDialog.addEventListener('close', () => {
    if (cartToast.parentElement === purchaseDialog) document.body.append(cartToast);
    cartToast.classList.remove('cart-toast-in-dialog');
});
purchaseGalleryPrevious.addEventListener('click', () => movePurchaseImage(-1));
purchaseGalleryNext.addEventListener('click', () => movePurchaseImage(1));
purchaseDialog.addEventListener('click', (event) => {
    if (event.target === purchaseDialog) purchaseDialog.close();
});
document.querySelectorAll('.payment-option').forEach((option) => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach((item) => item.setAttribute('aria-pressed', String(item === option)));
        if (option.dataset.paymentMethod === 'whatsapp') {
            const message = [
                'Olá! Tenho interesse nesta peça:',
                `Peça: ${purchaseTitle.textContent}`,
                `Categoria: ${purchaseCategory.textContent}`,
                `Preço: ${purchasePrice.textContent}`,
                `Tamanho: ${purchaseSize.textContent}`,
                `Disponibilidade: ${purchaseQuantity.textContent}`
            ].join('\n');
            const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            purchaseStatus.textContent = 'Abrindo sua conversa com a loja no WhatsApp.';
            return;
        }
        purchaseStatus.textContent = `Opção ${option.querySelector('strong').textContent} selecionada. Prévia visual, sem integração de pagamento.`;
    });
});

function clearProductPreviews() {
    productPreviewObjectUrls.forEach((source) => URL.revokeObjectURL(source));
    productPreviewObjectUrls = [];
    productPreviewImages.replaceChildren();
}

function renderProductPreviews() {
    clearProductPreviews();
    selectedProductFiles.forEach((file) => {
        const source = URL.createObjectURL(file);
        productPreviewObjectUrls.push(source);
        const preview = document.createElement('img');
        preview.src = source;
        preview.alt = `Prévia: ${file.name}`;
        productPreviewImages.append(preview);
    });
    const count = selectedProductFiles.length;
    productPreviewName.textContent = count
        ? `${count} ${count === 1 ? 'foto selecionada' : 'fotos selecionadas'}`
        : 'As fotos selecionadas aparecerão aqui.';
    if (count === 1) productFormStatus.textContent = 'Adicione mais uma foto para mostrar as setas.';
    else if (count > 1) productFormStatus.textContent = `${count} fotos selecionadas. As setas aparecerão no catálogo.`;
}

productImageInput.addEventListener('change', () => {
    const newFiles = [...productImageInput.files];
    productImageInput.value = '';
    if (!newFiles.length) return;
    if (newFiles.some((file) => !file.type.startsWith('image/') || file.size > 12 * 1024 * 1024)) {
        productFormStatus.textContent = 'Cada arquivo deve ser uma imagem de até 12 MB. As fotos anteriores foram mantidas.';
        return;
    }
    const uniqueFiles = newFiles.filter((file) => !selectedProductFiles.some((selectedFile) =>
        selectedFile.name === file.name && selectedFile.size === file.size && selectedFile.lastModified === file.lastModified
    ));
    const remainingSlots = 5 - selectedProductFiles.length;
    if (!remainingSlots) {
        productFormStatus.textContent = 'Você já selecionou o máximo de 5 fotos.';
        return;
    }
    selectedProductFiles = [...selectedProductFiles, ...uniqueFiles.slice(0, remainingSlots)];
    renderProductPreviews();
    if (uniqueFiles.length > remainingSlots) productFormStatus.textContent = 'Foram adicionadas fotos até o limite de 5.';
});

function compressImage(file, maxDimension, quality) {
    return new Promise((resolve, reject) => {
        const sourceUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(image.naturalWidth * scale);
            canvas.height = Math.round(image.naturalHeight * scale);
            const context = canvas.getContext('2d');
            URL.revokeObjectURL(sourceUrl);
            if (!context) {
                reject(new Error('Não foi possível processar a foto.'));
                return;
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        image.onerror = () => {
            URL.revokeObjectURL(sourceUrl);
            reject(new Error('Não foi possível abrir essa foto.'));
        };
        image.src = sourceUrl;
    });
}

 productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isAdminMode) return;
    const existingProduct = editingProductId
        ? customProducts.find((item) => item.id === editingProductId)
        : null;
    const files = [...selectedProductFiles];
    if ((editingProductId && !existingProduct) || (!existingProduct && !files.length) || files.length > 5 || files.some((file) => !file.type.startsWith('image/'))) {
        productFormStatus.textContent = 'Selecione de 1 a 5 fotos válidas da peça.';
        return;
    }
    if (files.some((file) => file.size > 12 * 1024 * 1024)) {
        productFormStatus.textContent = 'Cada foto deve ter no máximo 12 MB.';
        return;
    }
    productFormStatus.textContent = 'Salvando peça...';
    try {
        const formData = new FormData(productForm);
        const images = files.length
            ? await Promise.all(files.map((file) => compressImage(file, 1000, 0.68)))
            : getProductImages(existingProduct);
        if (!images.length) {
            productFormStatus.textContent = 'Adicione pelo menos uma foto à peça.';
            return;
        }
        const product = {
            id: existingProduct?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: formData.get('name').trim(),
            price: Number(formData.get('price')),
            category: formData.get('category'),
            size: formData.get('size').trim(),
            quantity: Number(formData.get('quantity')),
            images,
            image: images[0]
        };
        let savedProduct;

if (existingProduct) {
    const { data, error } = await supabaseClient
        .from('produtos')
        .update({
            nome: product.name,
            preço: product.price,
            categoria: product.category,
            imagem: product.image,
            estoque: product.quantity
        })
        .eq('id', existingProduct.id)
        .select()
        .single();

    if (error) throw error;

    savedProduct = data;
} else {
    const { data, error } = await supabaseClient
        .from('produtos')
        .insert({
            nome: product.name,
            preço: product.price,
            categoria: product.category,
            imagem: product.image,
            estoque: product.quantity
        })
        .select()
        .single();

    if (error) throw error;

    savedProduct = data;
}

await carregarProdutosSupabase();
        customProducts = updatedProducts;
        renderAllProducts();
        const statusMessage = existingProduct ? 'Alterações salvas.' : 'Peça adicionada ao catálogo.';
        productForm.hidden = Boolean(existingProduct);
        resetProductForm(statusMessage);
        if (existingProduct) showUploadFeedback(statusMessage);
   } catch (error) {
    console.error('ERRO AO SALVAR PRODUTO:', error);
    productFormStatus.textContent = 'Erro ao salvar. Veja o Console para descobrir o motivo.';
}
});

document.querySelector('.newsletter-form').addEventListener('submit', (event) => {
    event.preventDefault();
    event.currentTarget.querySelector('button').textContent = 'Cadastrado';
});
if (supabaseClient) {
        supabaseClient
                .from('produtos')
                .select('*')
                .then(({ data, error }) => {
                        console.log('Produtos:', data);
                        console.log('Erro:', error);
                });
}
