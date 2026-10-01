const SUPABASE_URL = "https://msdzqocpnivulabxbxnw.supabase.co";
const SUPABASE_KEY = "sb_publishable_6FuT27VhGSnG4nsOhtFvFg_JrGjCVV8";

const supabaseClient = window.supabase.createClient(
 SUPABASE_URL,
 SUPABASE_KEY
);


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
const productGrid = document.querySelector('.products');
const productImageInput = document.querySelector('#product-image');
const productPreviewImage = document.querySelector('#product-preview-image');
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

try {
    const storedProducts = JSON.parse(localStorage.getItem(customProductsKey) || '[]');
    if (Array.isArray(storedProducts)) customProducts = storedProducts;
    const storedCovers = JSON.parse(localStorage.getItem(coversKey) || '{}');
    if (storedCovers && typeof storedCovers === 'object' && !Array.isArray(storedCovers)) savedCovers = storedCovers;
    isAdminMode = localStorage.getItem(adminModeKey) === 'true';
} catch {
    productFormStatus.textContent = 'Não foi possível ler os produtos salvos neste navegador.';
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
    if (!enabled) productForm.hidden = true;
    try {
        localStorage.setItem(adminModeKey, String(enabled));
    } catch {
        productFormStatus.textContent = 'Não foi possível salvar essa configuração neste navegador.';
    }
}

function openProductForm() {
    if (!isAdminMode) return;
    if (activeCategory) showHome();
    productForm.hidden = false;
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

function renderCustomProduct(product, container = productGrid) {
    const card = document.createElement('article');
    card.className = 'product';
    card.dataset.productId = product.id;
    const imageFrame = document.createElement('div');
    imageFrame.className = 'product-image';
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = product.category;
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-product';
    removeButton.type = 'button';
    removeButton.hidden = !isAdminMode;
    removeButton.setAttribute('aria-label', `Remover ${product.name}`);
    removeButton.title = 'Remover peça';
    removeButton.innerHTML = '<i data-lucide="trash-2" size="16"></i>';
    removeButton.addEventListener('click', () => {
        if (!isAdminMode || !window.confirm(`Remover ${product.name} do catálogo?`)) return;
        const remainingProducts = customProducts.filter((item) => item.id !== product.id);
        try {
            localStorage.setItem(customProductsKey, JSON.stringify(remainingProducts));
            customProducts = remainingProducts;
            document.querySelectorAll('.product[data-product-id]').forEach((productCard) => {
                if (productCard.dataset.productId === product.id) productCard.remove();
            });
            updateEmptyStates();
            productFormStatus.textContent = 'Peça removida.';
        } catch {
            productFormStatus.textContent = 'Não foi possível atualizar os produtos salvos.';
        }
    });
    imageFrame.append(image, tag, removeButton);
    const info = document.createElement('div');
    info.className = 'product-info';
    const name = document.createElement('h3');
    name.textContent = product.name;
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    info.append(name, price);
    card.append(imageFrame, info);
    container.append(card);
    updateEmptyStates();
    if (window.lucide) lucide.createIcons();
}

customProducts.forEach((product) => renderCustomProduct(product));

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
    document.body.classList.remove('category-view-active');
    if (updateHistory && window.location.hash !== '#colecoes') window.location.hash = '#colecoes';
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
    const category = categoryFromHash();
    if (category) showCategory(category);
    else if (document.body.classList.contains('category-view-active')) showHome(false);
});

const initialCategory = categoryFromHash();
if (initialCategory) showCategory(initialCategory);

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
});

productImageInput.addEventListener('change', () => {
    const file = productImageInput.files[0];
    if (!file) return;
    productPreviewImage.src = URL.createObjectURL(file);
    productPreviewImage.hidden = false;
    productPreviewName.textContent = file.name;
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
    const file = productImageInput.files[0];
    if (!file || !file.type.startsWith('image/')) {
        productFormStatus.textContent = 'Selecione um arquivo de imagem válido.';
        return;
    }
    if (file.size > 12 * 1024 * 1024) {
        productFormStatus.textContent = 'A foto deve ter no máximo 12 MB.';
        return;
    }
    productFormStatus.textContent = 'Salvando peça...';
    try {
        const formData = new FormData(productForm);
        const product = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: formData.get('name').trim(),
            price: Number(formData.get('price')),
            category: formData.get('category'),
            image: await compressImage(file, 1200, 0.78)
        };
        const updatedProducts = [...customProducts, product];
        localStorage.setItem(customProductsKey, JSON.stringify(updatedProducts));
        customProducts = updatedProducts;
        renderCustomProduct(product);
        productForm.reset();
        productPreviewImage.removeAttribute('src');
        productPreviewImage.hidden = true;
        productPreviewName.textContent = 'A foto selecionada aparecerá aqui.';
        productFormStatus.textContent = 'Peça adicionada ao catálogo.';
    } catch {
        productFormStatus.textContent = 'Não foi possível salvar. O armazenamento do navegador pode estar cheio.';
    }
});

document.querySelector('.newsletter-form').addEventListener('submit', (event) => {
    event.preventDefault();
    event.currentTarget.querySelector('button').textContent = 'Cadastrado';
});
supabaseClient
  .from('produtos')
  .select('*')
  .then(({ data, error }) => {
    console.log("Produtos:", data);
    console.log("Erro:", error);
  });
console.log("Supabase conectado:", supabaseClient);
