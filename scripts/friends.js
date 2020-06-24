define(function() {
    let friends = {};

    function makeFriend(id, initPos) {
        if (friends[Number(id)]) return;
        console.log('MAKING FRIEND', id)
        friends[Number(id)] = {
            pos:{x: initPos.x, y: initPos.y, s: 1, a: initPos.a},
            targetPos:{x: 0, y: 0, a: 0},
            id: id
        }
    }

    function moveFriendArms(data) {
        if (!data) return;
        for (row of data) {
            makeFriend(row.playerId, row.armPos);
            friends[Number(row.playerId)].targetPos = row.armPos;
        }
    }

    function addId(id) {
        friends[Number(id)] = false;
    }

    function tick() {
        for (id of Object.keys(friends)) {
            let friend = friends[id];
            if (!friend) continue;
            const THRESHOLD = 1;
            const SPEED_MULTIPLIER = 2;
            if (Math.abs(friend.pos.x - friend.targetPos.x) < THRESHOLD && Math.abs(friend.pos.y - friend.targetPos.y) < THRESHOLD) return;
            let x1 = friend.pos.x;
            let y1 = friend.pos.y;
            let x2 = friend.targetPos.x;
            let y2 = friend.targetPos.y;

            let angle = Math.atan2(y2-y1, x2-x1);
            let distance = Math.hypot(x2-x1, y2-y1);


            // ease speed based on distance to target
            if (distance > friend.pos.s) {
                friend.pos.s = friend.pos.s * SPEED_MULTIPLIER;
            } else if (friend.pos.s > distance && friend.pos.s / SPEED_MULTIPLIER > distance) {
                friend.pos.s = distance / SPEED_MULTIPLIER;
            } else if (friend.pos.s > distance) {
                friend.pos.s = distance / SPEED_MULTIPLIER;
            }
            if (friend.pos.s < 1) friend.pos.s = 1;

            // between 0 and 360;
            if (friend.pos.a - friend.targetPos.a) {

            }

            friend.pos.a = friend.targetPos.a;
            friend.pos.x += Math.cos(angle) * friend.pos.s;
            friend.pos.y += Math.sin(angle) * friend.pos.s;
        }
    }

    return {
        tick: tick,
        moveFriendArms: moveFriendArms,
        addId: addId,
        getFriendsPos: function() {return Object.values(friends)},
        currentIdsCallback: function() {return Object.keys(friends).map(Number)},
    }
});