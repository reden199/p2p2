const serverSpots = {};

const mustNotInclude = { "yaw": 0, "health": 100, "maxHealth": 100, "damage": 10, "height": 32, "width": 32, "collisionRadius": 70, "entityClass": "Prop", "dead": 0, "timeDead": 0, "slowed": 0, "stunned": 0, "hits": [], "interpolatedYaw": 0 };

const toInclude = (entity) => {
    for (let i in mustNotInclude) {
        entity[i] = mustNotInclude[i];
    }
    return entity;
}

const getRealPosOfIndex = (index) => {
    return {
        x: ((((index * 100).toFixed(2) - "") % 5000000) | 0) / 100,
        y: (index / 50000 | 0) / 100
    }
}

const decodeSpotJSON = (json) => {
    const arr = JSON.parse(json);
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            obj[i + 1] = { model: detectModelByUid(i + 1), position: getRealPosOfIndex(arr[i]), uid: i + 1 };
        }
    }
    return obj;
}

const detectModelByUid = (uid) => {
    if (0 < uid && uid <= 400) {
        return "Tree";
    }
    if (400 < uid && uid <= 800) {
        return "Stone";
    }
    if (800 < uid && uid <= 825) {
        return "NeutralCamp";
    }
}

window.applyServerSpotsToGame = (owner = window.ban) => {
    if (!owner || owner.spotId === game.options.serverId) return !!owner;
    owner.spotId = game.options.serverId;
    if (!serverSpots[owner.spotId]) return true;
    const spots = decodeSpotJSON(serverSpots[owner.spotId].spotEncoded);
    game.world.spots = spots;
    game.world.toInclude = toInclude;
    for (let i in spots) {
        const entity = toInclude(spots[i]);
        game.world.createEntity(entity);
    }
    return true;
}

window.activateServerSpots = () => {
    if (window.loadSpots || !window.ban || ban.scripts.serverspots) return;
    window.loadSpots = true;
    setTimeout(() => {
        ban.scripts.serverspots = true;
        window.applyServerSpotsToGame(ban);
    }, 1000);
}

game.network.addPacketHandler(4, (data) => {
    if (data.allowed) window.activateServerSpots();
});