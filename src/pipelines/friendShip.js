export const buildFriendshipPipeline = (loggedInUser, searchQuery) => {
    const baseQuery = {
      $or: [
        { friendA: loggedInUser },
        { friendB: loggedInUser }
      ]
    };
  
    const searchMatch = searchQuery
      ? {
          $or: [
            { "friend.name": { $regex: searchQuery, $options: "i" } },
            { "friend.username": { $regex: searchQuery, $options: "i" } }
          ]
        }
      : null;
  
    return [
      // 1. Match friendships where user is friendA or friendB
      { $match: baseQuery },
  
      // 2. Lookup friendA and friendB with minimal fields
      {
        $lookup: {
          from: "users",
          localField: "friendA",
          foreignField: "_id",
          as: "friendA",
          pipeline: [
            { $project: { _id: 1, name: 1 , profilePic :1} }
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "friendB",
          foreignField: "_id",
          as: "friendB",
          pipeline: [
            { $project: { _id: 1, name: 1 , profilePic :1 } }
          ]
        }
      },
  
      // 3. Flatten the friendA and friendB arrays
      { $unwind: { path: "$friendA" } },
      { $unwind: { path: "$friendB" } },
  
      // 4. Add a new field 'friend' to identify the *other* person
      {
        $addFields: {
          friend: {
            $cond: [
              { $eq: ["$friendA._id", loggedInUser] },
              "$friendB",
              "$friendA"
            ]
          }
        }
      },
  
      // 5. Apply search if provided (on friend's name or username)
      ...(searchMatch ? [{ $match: searchMatch }] : []),
  
      // 6. Sort by friend's name (or createdAt as in original)
      { $sort: { createdAt: -1 } },
  
      // 7. Project only the friend field
      { $project: { friend: 1 } }
    ];
  };
  