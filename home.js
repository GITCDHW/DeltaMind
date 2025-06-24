if (typeof rtdb === 'undefined') {
    console.error("Firebase Realtime Database (rtdb) is not initialized. Please check config.js.");
}

const blogPostsContainer = document.querySelector('.blog-posts-container');
const viewAllBlogsButtonContainer = document.querySelector('.view-all-button-container');

// Function to fetch author name (reused from post.js)
async function getUserName(userId) {
  if (!userId) {
    return "Anonymous Author";
  }
  const userRef = rtdb.ref(`users/${userId}`);
  try {
    const userData = await userRef.once("value");
    const userDataValue = userData.val();
    return userDataValue && userDataValue.DisplayName ? userDataValue.DisplayName : "Anonymous Author";
  } catch (error) {
    console.error(`Error fetching user data for ID ${userId}:`, error);
    return "Anonymous Author";
  }
}

// Function to fetch and display latest blog posts
async function loadLatestBlogPosts() {
    if (!blogPostsContainer) {
        console.error("'.blog-posts-container' not found in HTML.");
        return;
    }

    blogPostsContainer.innerHTML = '<p style="text-align: center; color: #fff;">Loading latest blogs...</p>';

    try {
        // Query the 'blogs' node, order by 'Timestamp' descending, and limit to 3
        const blogsRef = rtdb.ref('blogs').orderByChild('Timestamp').limitToLast(3);
        const snapshot = await blogsRef.once('value');

        if (snapshot.exists()) {
            const blogsData = snapshot.val();
            const posts = [];

            // Convert object to array and sort by timestamp (Firebase's limitToLast gives older first by default)
            snapshot.forEach(childSnapshot => {
                const post = childSnapshot.val();
                post.id = childSnapshot.key; // Get the postId
                posts.push(post);
            });

            // Sort posts in descending order of timestamp to get truly "latest"
            posts.sort((a, b) => b.Timestamp - a.Timestamp);

            blogPostsContainer.innerHTML = ''; // Clear loading message

            for (const post of posts) {
                const authorName = await getUserName(post.Author);
                const postDate = post.Timestamp ? new Date(post.Timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Unknown Date';
                
                const shortDescription = post.ShortDescription || 'No description available.';

                const blogCardHTML = `
                    <a href="post.html?pId=${post.id}" target="_blank" class="blog-card">
                        <div class="blog-info">
                            <h3 class="blog-title">${post.Title || 'Untitled Post'}</h3>
                            <p class="blog-meta">
                                <span class="blog-date">${postDate}</span> &bull;
                                <span class="blog-author">By ${authorName}</span>
                            </p>
                            <p class="blog-description">${shortDescription}</p>
                            <button class="read-more-button">Read More</button>
                        </div>
                    </a>
                `;
                blogPostsContainer.insertAdjacentHTML('beforeend', blogCardHTML);
            }
        } else {
            blogPostsContainer.innerHTML = '<p style="text-align: center; color: #fff;">No blog posts found yet.</p>';
        }
    } catch (error) {
        console.error("Error fetching latest blog posts:", error);
        blogPostsContainer.innerHTML = '<p style="text-align: center; color: #fff;">Failed to load blogs. Please try again later.</p>';
    }
}

// Load blogs when the page content is fully loaded
document.addEventListener('DOMContentLoaded', loadLatestBlogPosts);