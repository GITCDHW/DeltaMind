const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("pId");

if (!postId) {
    console.error("Post ID not found in URL. Please provide a 'pId' parameter (e.g., ?pId=YOUR_POST_ID).");

    document.querySelector('.post-title').innerHTML = "Error: Post ID Missing";
    document.querySelector('.post-content').innerHTML = "<p>Please ensure you have a valid post ID in the URL.</p>";
    throw new Error("Missing Post ID"); 
}

const titleElement = document.querySelector('.post-title');
const contentElement = document.querySelector('.post-content');
const authorElement = document.querySelector('.post-author');
const dateElement = document.querySelector('.post-date');     // Renamed to avoid conflict

// Check if elements are found
if (!titleElement || !contentElement || !authorElement || !dateElement) {
    console.error("One or more blog post display elements not found in HTML. Check your class names.");
    // Stop execution if critical elements are missing
    throw new Error("HTML elements for post display are missing.");
}

const postRef = rtdb.ref(`blogs/${postId}`);

async function getUserName(userId) {
  if (!userId) {
    console.warn("getUserName called with empty userId. Returning 'anonymous user'.");
    return "anonymous user";
  }
  const userRef = rtdb.ref(`users/${userId}`);
  try {
    const userData = await userRef.once("value");
    const userDataValue = userData.val();
    // Return DisplayName if it exists, otherwise "anonymous user"
    return userDataValue && userDataValue.DisplayName ? userDataValue.DisplayName : "anonymous user";
  } catch (error) {
    console.error(`Error fetching user data for ID ${userId}:`, error);
    return "anonymous user"; // Fallback on error
  }
}

// Fetch post data and update the DOM
postRef.once("value").then(async snapshot => {
  if (snapshot.exists()) {
    const postDetails = snapshot.val(); // snapshot.val() is synchronous

    // Use default values if properties are missing
    const postTitle = postDetails.Title || "Untitled Post";
    const postContent = postDetails.content || "No content available for this post.";
    
    let postDate = "Unknown Date";
    if (postDetails.Timestamp) {
        try {
            postDate = new Date(postDetails.Timestamp).toLocaleString();
        } catch (e) {
            console.error("Error parsing post timestamp:", e);
        }
    }
    const authorId = postDetails.Author; 
    const postAuthor = await getUserName(authorId);
    
    // Update the HTML elements
    titleElement.innerHTML = postTitle;
    contentElement.innerHTML = postContent;
    dateElement.innerHTML = postDate;
    authorElement.innerHTML = `by ${postAuthor}`;
    authorElement.setAttribute("data-post-author",postAuthor)
    authorElement.setAttribute("data-post-author-id",authorId)

    console.log("Post loaded successfully!");

  } else {
    // Post with the given ID does not exist
    console.warn(`Post with ID "${postId}" does not exist.`);
    titleElement.innerHTML = "Post Not Found";
    contentElement.innerHTML = `<p>The blog post you are looking for (${postId}) does not exist or has been removed.</p>`;
    authorElement.innerHTML = "";
    dateElement.innerHTML = "";
  }
}).catch(error => {
  // Handle any errors during the Firebase database read
  console.error("Error fetching blog post data:", error);
  titleElement.innerHTML = "Error Loading Post";
  contentElement.innerHTML = `<p>An error occurred while trying to load the post. Please try again later.</p><p>Error details: ${error.message}</p>`;
  authorElement.innerHTML = "";
  dateElement.innerHTML = "";
});

function showUserCard(){
     const userProfileRef=rtdb.ref(`users/${authorElement.getAttribute("data-post-author-id")}`);
      
      document.getElementById("userCard").style.display="flex";
      const userName=document.querySelector(".profile-name")
      const userBio = document.querySelector(".profile-tagline")
      const userId = document.querySelector(".profile-id")
      
      userName.innerHTML = authorElement.getAttribute("data-post-author")
      userId.innerHTML = authorElement.getAttribute("data-post-author-id")
      userProfileRef.once("value").then(snapshot=>{
        
       if(snapshot.exists()) {
          const userProfileData = snapshot.val()
          userBio.innerHTML=userProfileData.Bio
        }
      })
    }
    
    authorElement.addEventListener("click",showUserCard)