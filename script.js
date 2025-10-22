// Replace these with your actual Google Form URLs
const FORM_URLS = {
    SELL: "https://docs.google.com/forms/d/e/1FAIpQLSfLawoPBdr1NikoulKyGQgm31HMkKtCUMAqs_WNv6cIvJamRA/viewform?usp=publish-editor
",
    BUY: "https://docs.google.com/forms/d/e/1FAIpQLSdzGcZ8On8Bnh09sa-pWca7NcLBNOtdrW_hWhiqkWOh0fg3qg/viewform?usp=publish-editor", 
    REPORT: "https://docs.google.com/forms/d/e/1FAIpQLSdAh29HyY8GhU5hjC5T0QhUQOJQduURC72Fp-8lYoDXIvatDQ/viewform?usp=publish-editor"
};

// Sample data - In real implementation, this comes from Google Sheets
let allPosts = [];
let filteredPosts = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadSampleData(); // Replace this with actual Google Sheets data loading
    renderPosts(allPosts);
});

// Sample data function - REPLACE THIS WITH ACTUAL GOOGLE SHEETS INTEGRATION
function loadSampleData() {
    allPosts = [
        {
            type: "Sell",
            title: "Clean Plastic Bottles",
            category: "Plastic",
            quantity: "100",
            rate: "20",
            unit: "Kg",
            city: "Mumbai",
            mobile: "9876543210",
            email: "seller1@example.com",
            timestamp: "2024-01-15",
            vendor: "Raj Sharma"
        },
        {
            type: "Buy", 
            title: "Need Copper Wires",
            category: "Metal",
            quantity: "500",
            rate: "300",
            unit: "Kg",
            city: "Delhi",
            mobile: "9876543211",
            email: "buyer1@example.com",
            timestamp: "2024-01-14",
            vendor: "Amit Kumar"
        }
    ];
    
    updateCityFilter();
}

// Render posts to the page
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="loading">No posts found matching your filters.</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <div class="post-type ${post.type.toLowerCase()}">${post.type}</div>
            </div>
            <div class="post-details">
                <div class="post-meta"><strong>Category:</strong> ${post.category}</div>
                <div class="post-meta"><strong>Quantity:</strong> ${post.quantity} ${post.unit}</div>
                <div class="post-meta"><strong>Rate:</strong> ₹${post.rate} per ${post.unit}</div>
                <div class="post-meta"><strong>City:</strong> ${post.city}</div>
            </div>
            <div class="post-contact">
                <div class="post-meta"><strong>📞 Mobile:</strong> ${post.mobile}</div>
                <div class="post-meta"><strong>✉️ Email:</strong> ${post.email}</div>
            </div>
            <button class="report-btn" onclick="openReportForm('${post.vendor}')">
                Report Fraud/Abuse
            </button>
        </div>
    `).join('');
}

// Filter functions
function toggleFilter() {
    const filterSection = document.getElementById('filterSection');
    filterSection.style.display = filterSection.style.display === 'none' ? 'flex' : 'none';
}

function updateCityFilter() {
    const cities = [...new Set(allPosts.map(post => post.city))];
    const cityFilter = document.getElementById('cityFilter');
    
    cityFilter.innerHTML = '<option value="">All Cities</option>' +
        cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const city = document.getElementById('cityFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    filteredPosts = allPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
                            post.category.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || post.category === category;
        const matchesCity = !city || post.city === city;
        const matchesType = !type || post.type === type;
        
        return matchesSearch && matchesCategory && matchesCity && matchesType;
    });
    
    renderPosts(filteredPosts);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('cityFilter').value = '';
    document.getElementById('typeFilter').value = '';
    renderPosts(allPosts);
}

// Modal functions
function openSellForm() {
    document.getElementById('sellForm').src = FORM_URLS.SELL;
    document.getElementById('sellModal').style.display = 'block';
}

function closeSellForm() {
    document.getElementById('sellModal').style.display = 'none';
    document.getElementById('sellForm').src = '';
}

function openBuyForm() {
    document.getElementById('buyForm').src = FORM_URLS.BUY;
    document.getElementById('buyModal').style.display = 'block';
}

function closeBuyForm() {
    document.getElementById('buyModal').style.display = 'none';
    document.getElementById('buyForm').src = '';
}

function openReportForm(vendorName) {
    // Pre-fill the vendor name in the report form
    const reportUrl = `${FORM_URLS.REPORT}?entry.XXXXX=${encodeURIComponent(vendorName)}`;
    document.getElementById('reportForm').src = reportUrl;
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportForm() {
    document.getElementById('reportModal').style.display = 'none';
    document.getElementById('reportForm').src = '';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = ['sellModal', 'buyModal', 'reportModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
            document.getElementById(modalId.replace('Modal', 'Form')).src = '';
        }
    });

}
