export const buildChatPipeline = (loggedInUser, searchQuery) => {
  const baseQuery = {
    users: { $in: [loggedInUser] },
    isDeleted: false,
    deletedAt: null,
    lastMessage: { $ne: null }
  };

  const regexSearch = searchQuery
    ? {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } }
      ]
    }
    : null;

  return [
    { $match: baseQuery },

    {
      $lookup: {
        from: "users",
        let: { chatUsers: "$users" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$_id", "$$chatUsers"] },
                  { $ne: ["$_id", loggedInUser] },
                ],
              },
              ...(regexSearch || {}),
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              name: 1,
              profilePic: 1,
              coverPic: 1,
            },
          },
        ],
        as: "users",
      },
    },

    ...(searchQuery
      ? [
        {
          $match: {
            $expr: { $gt: [{ $size: "$users" }, 0] },
          },
        },
      ]
      : []),

    {
      $lookup: {
        from: "messages",
        let: { lastMessageId: "$lastMessage" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$lastMessageId"] },
            },
          },
          {
            $project: {
              content: 1,
              sender: 1,
              createdAt: 1,
              isRead: 1,
              type : 1
            },
          },
        ],
        as: "lastMessage",
      },
    },
    {
      $unwind: {
        path: "$lastMessage",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        users: 1,
        createdAt: 1,
        lastMessage: 1,
      },
    },
    {
      $sort: {
        "lastMessage.createdAt": -1,
      },
    },
  ];
};
