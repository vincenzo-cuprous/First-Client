// Global variables
let books = [];
let currentBookIndex = 0;
let adminCredentials = {};

// Fetch books from the server
async function fetchBooks() {
    const response = await fetch('/api/books');
    books = await response.json();
    renderBooks(books);
}

// Function to create book cards
function createBookCard(book, index) {
    return `
        <div class="book-card" data-index="${index}">
            <img src="${book.image}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x250?text=Book+Cover'">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
            </div>
        </div>
    `;
}

// Function to render books
function renderBooks(booksToRender) {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = '';
    booksToRender.forEach((book, index) => {
        booksGrid.innerHTML += createBookCard(book, index);
    });
}

// Initial render
fetchBooks();

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

function performSearch() {
    const query = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
    );
    renderBooks(filteredBooks);
}

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Book preview functionality
const previewOverlay = document.getElementById('previewOverlay');
const previewImage = document.getElementById('previewImage');
const previewTitle = document.getElementById('previewTitle');
const previewAuthor = document.getElementById('previewAuthor');
const previewDescription = document.getElementById('previewDescription');
const downloadBtn = document.getElementById('downloadBtn');
const closePreview = document.querySelector('.close-preview');
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');

document.getElementById('booksGrid').addEventListener('click', (e) => {
    const bookCard = e.target.closest('.book-card');
    if (bookCard) {
        const index = bookCard.dataset.index;
        currentBookIndex = index;
        const book = books[index];
        previewImage.src = book.image;
        previewImage.alt = book.title;
        
        previewTitle.textContent = book.title;
        previewAuthor.textContent = book.author;
        previewDescription.textContent = book.description;
        downloadBtn.href = book.downloadUrl;
        previewOverlay.classList.add('active');
        renderComments(book.id);
    }
});

closePreview.addEventListener('click', () => {
    previewOverlay.classList.remove('active');
});

// Comment functionality
async function renderComments(bookId) {
    commentsList.innerHTML = '';
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.comments.forEach((comment) => {
            const commentElement = document.createElement('li');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <p class="comment-name">${comment.name}</p>
                <p>${comment.text}</p>
                ${comment.reply ? `<p><strong>Reply:</strong> ${comment.reply}</p>` : ''}
            `;
            commentsList.appendChild(commentElement);
        });
    }
}

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('commentName').value;
    const text = document.getElementById('commentText').value;
    if (name && text) {
        const bookId = books[currentBookIndex].id;
        const response = await fetch(`/api/books/${bookId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, text }),
        });
        if (response.ok) {
            const newComment = await response.json();
            books[currentBookIndex].comments.push(newComment);
            renderComments(bookId);
            commentForm.reset();
        }
    }
});

// Admin functionality
// ... (rest of the admin code remains unchanged)

 // Admin functionality
 const adminLink = document.getElementById('adminLink');
 const adminOverlay = document.getElementById('adminOverlay');
 const loginForm = document.getElementById('loginForm');
 const adminPanel = document.getElementById('adminPanel');
 const bookForm = document.getElementById('bookForm');
 const adminBooks = document.getElementById('adminBooks');
 const adminComments = document.getElementById('adminComments');
 const userSettingsForm = document.getElementById('userSettingsForm');
 const logoutBtn = document.getElementById('logoutBtn');

 adminLink.addEventListener('click', (e) => {
     e.preventDefault();
     adminOverlay.classList.add('active');
 });

 loginForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     const username = document.getElementById('username').value;
     const password = document.getElementById('password').value;
     const response = await fetch('/api/admin');
     adminCredentials = await response.json();
     if (username === adminCredentials.username && password === adminCredentials.password) {
         loginForm.style.display = 'none';
         adminPanel.style.display = 'block';
         renderAdminBooks();
         renderAdminComments();
     } else {
         alert('Invalid credentials');
     }
 });

 function renderAdminBooks() {
     adminBooks.innerHTML = '';
     books.forEach((book) => {
         const bookElement = document.createElement('div');
         bookElement.className = 'admin-book';
         bookElement.innerHTML = `
             <h4 class="admin-book-title">${book.title}</h4>
             <p>${book.author}</p>
             <div class="admin-actions">
                 <button onclick="editBook('${book.id}')">Edit</button>
                 <button onclick="deleteBook('${book.id}')">Delete</button>
             </div>
         `;
         adminBooks.appendChild(bookElement);
     });
 }

 async function editBook(id) {
     const book = books.find(b => b.id === id);
     if (book) {
         document.getElementById('bookTitle').value = book.title;
         document.getElementById('bookAuthor').value = book.author;
         document.getElementById('bookImage').value = book.image;
         document.getElementById('bookDownload').value = book.downloadUrl;
         document.getElementById('bookDescription').value = book.description;
         bookForm.dataset.editId = id;
     }
 }

 async function deleteBook(id) {
     const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
     if (response.ok) {
         books = books.filter(b => b.id !== id);
         renderBooks();
         renderAdminBooks();
         renderAdminComments();
     }
 }

 bookForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     const newBook = {
         title: document.getElementById('bookTitle').value,
         author: document.getElementById('bookAuthor').value,
         image: document.getElementById('bookImage').value,
         downloadUrl: document.getElementById('bookDownload').value,
         description: document.getElementById('bookDescription').value,
     };
     const editId = bookForm.dataset.editId;
     let response;
     if (editId) {
         response = await fetch(`/api/books/${editId}`, {
             method: 'PUT',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify(newBook),
         });
     } else {
         response = await fetch('/api/books', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify(newBook),
         });
     }
     if (response.ok) {
         const updatedBook = await response.json();
         if (editId) {
             const index = books.findIndex(b => b.id === editId);
             if (index !== -1) {
                 books[index] = updatedBook;
             }
         } else {
             books.push(updatedBook);
         }
         renderBooks();
         renderAdminBooks();
         bookForm.reset();
         bookForm.dataset.editId = '';
     }
 });

 function renderAdminComments() {
     adminComments.innerHTML = '';
     books.forEach((book) => {
         if (book.comments.length > 0) {
             const bookComments = document.createElement('div');
             bookComments.innerHTML = `<h4>${book.title}</h4>`;
             book.comments.forEach((comment) => {
                 const commentElement = document.createElement('div');
                 commentElement.className = 'comment';
                 commentElement.innerHTML = `
                     <p><strong>${comment.name}:</strong> ${comment.text}</p>
                     ${comment.reply ? `<p><strong>Reply:</strong> ${comment.reply}</p>` : ''}
                     <div class="comment-actions">
                         <button onclick="deleteComment('${book.id}', '${comment.id}')">Delete</button>
                         <button onclick="showReplyForm('${book.id}', '${comment.id}')">Reply</button>
                     </div>
                     <div class="reply-form" id="replyForm-${book.id}-${comment.id}">
                         <textarea placeholder="Your reply"></textarea>
                         <button onclick="submitReply('${book.id}', '${comment.id}')">Submit Reply</button>
                     </div>
                 `;
                 bookComments.appendChild(commentElement);
             });
             adminComments.appendChild(bookComments);
         }
     });
 }

 async function deleteComment(bookId, commentId) {
     const response = await fetch(`/api/books/${bookId}/comments/${commentId}`, { method: 'DELETE' });
     if (response.ok) {
         const bookIndex = books.findIndex(b => b.id === bookId);
         if (bookIndex !== -1) {
             books[bookIndex].comments = books[bookIndex].comments.filter(c => c.id !== commentId);
             renderAdminComments();
         }
     }
 }

 function showReplyForm(bookId, commentId) {
     const replyForm = document.getElementById(`replyForm-${bookId}-${commentId}`);
     replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
 }

 async function submitReply(bookId, commentId) {
     const replyForm = document.getElementById(`replyForm-${bookId}-${commentId}`);
     const replyText = replyForm.querySelector('textarea').value;
     if (replyText) {
         const response = await fetch(`/api/books/${bookId}/comments/${commentId}`, {
             method: 'PUT',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ reply: replyText }),
         });
         if (response.ok) {
             const updatedComment = await response.json();
             const bookIndex = books.findIndex(b => b.id === bookId);
             if (bookIndex !== -1) {
                 const commentIndex = books[bookIndex].comments.findIndex(c => c.id === commentId);
                 if (commentIndex !== -1) {
                     books[bookIndex].comments[commentIndex] = updatedComment;
                     renderAdminComments();
                 }
             }
         }
     }
 }

 userSettingsForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     const newUsername = document.getElementById('newUsername').value;
     const newPassword = document.getElementById('newPassword').value;
     if (newUsername || newPassword) {
         const response = await fetch('/api/admin', {
             method: 'PUT',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ username: newUsername, password: newPassword }),
         });
         if (response.ok) {
             alert('User settings updated');
             userSettingsForm.reset();
         } else {
             alert('Error updating user settings');
         }
     }
 });

 logoutBtn.addEventListener('click', () => {
     loginForm.style.display = 'block';
     adminPanel.style.display = 'none';
     adminOverlay.classList.remove('active');
 });


//   New Yaki 

// Search functionality
// const searchInput = document.getElementById('searchInput');
// const searchButton = document.getElementById('searchButton');

function performSearch() {
   const query = searchInput.value.toLowerCase();
   const filteredBooks = books.filter(book => 
       book.title.toLowerCase().includes(query) || 
       book.author.toLowerCase().includes(query) ||
       book.description.toLowerCase().includes(query)
   );
   renderBooks(filteredBooks);
}

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
   if (e.key === 'Enter') {
       performSearch();
   }
});

// Update the renderBooks function to accept a books array
function renderBooks(booksToRender = books) {
   const booksGrid = document.getElementById('booksGrid');
   booksGrid.innerHTML = '';
   booksToRender.forEach((book, index) => {
       booksGrid.innerHTML += createBookCard(book, index);
   });
}

// Update the initial render call
fetchBooks().then(() => renderBooks());

// Existing code...

// Update the fetchBooks function to call renderBooks after fetching
async function fetchBooks() {
   const response = await fetch('/api/books');
   books = await response.json();
   renderBooks();
}






















// Add these functions at the end of your book_script.js file

// Backup functionality
document.getElementById('backupBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        const backupData = JSON.stringify(books, null, 2);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'books_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Backup failed:', error);
        alert('Backup failed. Please try again.');
    }
});

// Restore functionality
document.getElementById('restoreBtn').addEventListener('click', () => {
    document.getElementById('restoreFile').click();
});

document.getElementById('restoreFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        try {
            const content = await file.text();
            const restoredBooks = JSON.parse(content);
            
            // Confirm before overwriting
            if (confirm('Are you sure you want to restore this data? This will overwrite existing books.')) {
                // Delete all existing books
                for (let book of books) {
                    await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
                }
                
                // Add restored books
                for (let book of restoredBooks) {
                    await fetch('/api/books', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(book)
                    });
                }
                
                alert('Data restored successfully!');
                fetchBooks(); // Refresh the book list
                renderAdminBooks(); // Refresh the admin book list
            }
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Restore failed. Please check the file and try again.');
        }
    }
});