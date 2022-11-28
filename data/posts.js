//post route
const mongoCollections = require("../config/mongoCollections");
const posts = mongoCollections.posts;
const { ObjectId } = require("mongodb");
const users = mongoCollections.users;
const validation = require("../helper");
// const { users } = require(".");

const createPost = async (
  userId,
  postTitle,
  postBody,
  // postPicture,
  mapCordinate,
  preference
) => {
  console.log("in post data");

  if (
    !validation.validString(postTitle) ||
    !validation.validString(postBody) ||
    !validation.validId(userId)
  )
    throw "All fields need to have valid values";
  // if (!postPicture || postPicture == "") {
  //   postPicture = "";
  // }
  // if (!validation.isValidDate(postDate)) throw "date is not valid";
  const date = new Date();
  let day = date.getDate();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let year = String(date.getFullYear()).padStart(2, "0");
  let currentDate = `${month}/${day}/${year}`;

  let newPost = {
    userId: userId,
    postTitle: postTitle,
    postDate: currentDate,
    postBody: postBody,
    comments: [],
    // postPicture: postPicture,
  };

  const postCollection = await posts();
  const userCollection = await users();
  const insertInfo = await postCollection.insertOne(newPost);
  if (!insertInfo.acknowledged || insertInfo.insertedCount === 0)
    throw "could not add post";
  else {
    const updatedInfo = await userCollection.updateOne(
      { _id: ObjectId(userId) },
      { $push: { postId: String(newPost._id) } }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw "Could not update Restaurant Collection with Review Data!";
    }
  }
  const newId = insertInfo.insertedId;
  const newIDString = String(newId);
  const post = await getPostById(newIDString);
  // post._id = post._id.toString();
  return post;
};
//post listing
const getAllPosts = async () => {
  const postCollection = await posts();
  const postList = await postCollection.find({}).toArray();
  if (!postList) throw "No post with that id";
  //convert id to string
  for (let post of postList) {
    post._id = post._id.toString();
  }
  if (postList.length == 0) return [];
  return postList;
};
//post individual
const getPostById = async (id) => {
  const postId = validation.validId(id);
  const postCollection = await posts();
  const post = await postCollection.findOne({ _id: ObjectId(postId) });
  if (post === null) throw "No post with that id";
  return post;
};
//edit post once user login
const removePostById = async (id) => {
  postId = validation.validId(id);

  const postCollection = await posts();
  const post = await postCollection.findOne({ _id: ObjectId(postId) });
  if (post === null) throw "No post with that id";
  const deletionInfo = await postCollection.deleteOne({
    _id: ObjectId(postId),
  });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete movie with id of ${id}`;
  }
  return { postId: postId, deleted: true };
};
//edit post once user login
const updatePostbyId = async (id, postTitle, postBody) => {
  let postId = validation.validId(id);

  if (!validation.validString(postTitle) || !validation.validString(postBody))
    throw "All fields need to have valid values";
  const postCollection = await posts();
  // const movie = await getMovieById(postId);

  const post = await postCollection.findOne({ _id: ObjectId(postId) });
  if (post === null) throw "No post with that id";

  const date = new Date();

  let day = date.getDate();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let year = String(date.getFullYear()).padStart(2, "0");
  let currentDate = `${month}/${day}/${year}`;

  let updatedPost = {
    postTitle: postTitle,
    postDate: currentDate,
    postBody: postBody,
  };
  const updateInfo = await postCollection.updateOne(
    { _id: ObjectId(postId) },
    { $set: updatedPost }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Error: Update failed";
  const res = await getPostById(postId);
  return res;
};

//list of post user see after login
const getPostByuserId = async (id) => {
  let postId = validation.validId(id);

  const userCollection = await users();
  const userinfo = await userCollection.findOne({ _id: ObjectId(postId) });
  if (!userinfo) throw "Posts not found";
  return userinfo.postId;
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  removePostById,
  updatePostbyId,
  getPostByuserId,
};
