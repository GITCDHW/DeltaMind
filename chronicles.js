document.querySelector(".studio").addEventListener("click",()=>{
  window.location.href="studio.html"
})
const container = document.querySelector(".main-content")

async function getUserName(userId) {
  const userRef = rtdb.ref(`users/${userId}`);
  const userData = await userRef.once("value");
  const userDataValue = userData.val();
  return userDataValue ? userDataValue.DisplayName : "anonymous user";
}

blogRef.once('value').then(async snapshot => {
  
  if (snapshot.exists()) {
    const posts = snapshot.val();
    const blogCardPromises = Object.keys(posts).map(async (postId) => {
      const post = posts[postId];
      const timestamp = new Date(post.Timestamp).toLocaleString();
      const authorName = await getUserName(post.Author);

      const blogCard = document.createElement('div');
      blogCard.addEventListener("click",()=>{
        window.location.href=`post.html?pId=${postId}`;
      })
      blogCard.className = "blog-card";
      blogCard.innerHTML = `
        <h1 class="blog-title">${post.Title}</h1>
        <p class="blog-meta">${authorName} - ${timestamp}</p>`;

      return blogCard; // Return the created blog card
    });
    const blogCards = await Promise.all(blogCardPromises);

    blogCards.forEach(card => {
      container.appendChild(card);
    });

  } else {
    console.log("No blog posts found.");
    container.innerHTML = "<p>No blog posts available yet.</p>";
  }
}).catch(error => {
  console.error("Error fetching blog posts:", error);
});
