import Pusher from "pusher";

const pusher = new Pusher({
    appId: "1942283",
    key: "959ef13797782f3398eb",
    secret: "126876cc964144f08994",
    cluster: "eu",
    useTLS: true
});

export default pusher;

