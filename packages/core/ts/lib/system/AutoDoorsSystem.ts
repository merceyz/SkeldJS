import { HazelBuffer } from "@skeldjs/util";
import { SystemType, MapID } from "@skeldjs/constant";
import { MapDoors } from "@skeldjs/data";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { AutoOpenDoor } from "../misc/AutoOpenDoor";
import { DoorEvents } from "../misc/Door";
import { BaseSystemStatusEvents } from "./events";

export interface AutoDoorsSystemData {
    dirtyBit: number;
    doors: boolean[];
}

type BaseAutoDoorsSystemEvents = BaseSystemStatusEvents &
    DoorEvents;

export interface AutoDoorsSystemEvents extends BaseAutoDoorsSystemEvents {}

/**
 * Represents a system for doors that open after a period of time.
 *
 * See {@link AutoDoorsSystemEvents} for events to listen to.
 */
export class AutoDoorsSystem extends SystemStatus<AutoDoorsSystemData, AutoDoorsSystemEvents> {
    static systemType = SystemType.Doors as const;
    systemType = SystemType.Doors as const;

    /**
     * The dirty doors to be updated on the next fixed update.
     */
    dirtyBit: number;

    /**
     * The doors in the map.
     */
    doors: AutoOpenDoor[];

    constructor(
        ship: BaseShipStatus,
        data?: HazelBuffer | AutoDoorsSystemData
    ) {
        super(ship, data);
    }

    get dirty() {
        return this.dirtyBit > 0;
    }

    set dirty(val: boolean) {
        super.dirty = val;
    }

    Deserialize(reader: HazelBuffer, spawn: boolean) {
        if (!this.doors || this.doors.length !== MapDoors[MapID.TheSkeld]) {
            this.doors = new Array(MapDoors[MapID.TheSkeld])
                .fill(0)
                .map((door, i) => new AutoOpenDoor(this, i, false));
        }

        for (let i = 0; i < this.doors.length; i++) {
            const door = this.doors[i];
            if (typeof door === "boolean") {
                this.doors[i] = new AutoOpenDoor(this, i, door);
            }
        }

        if (spawn) {
            for (let i = 0; i < MapDoors[MapID.TheSkeld]; i++) {
                const open = reader.bool();
                this.doors.push(new AutoOpenDoor(this, i, open));
            }
        } else {
            const mask = reader.upacked();

            for (let i = 0; i < MapDoors[MapID.TheSkeld]; i++) {
                if (mask & (1 << i)) {
                    const door = this.doors[i];
                    door.open = open;
                }
            }
        }
    }

    Serialize(writer: HazelBuffer, spawn: boolean) {
        if (!this.doors || this.doors.length !== MapDoors[MapID.TheSkeld]) {
            this.doors = new Array(MapDoors[MapID.TheSkeld])
                .fill(0)
                .map((door, i) => new AutoOpenDoor(this, i, true));
        }

        for (let i = 0; i < this.doors.length; i++) {
            const door = this.doors[i];
            if (typeof door === "boolean") {
                this.doors[i] = new AutoOpenDoor(this, i, door);
            }
        }

        if (spawn) {
            for (let i = 0; i < MapDoors[MapID.TheSkeld]; i++) {
                this.doors[i].Serialize(writer, spawn);
            }
        } else {
            writer.upacked(this.dirtyBit);

            for (let i = 0; i < MapDoors[MapID.TheSkeld]; i++) {
                if (this.dirtyBit & (1 << i)) {
                    this.doors[i].Serialize(writer, spawn);
                }
            }
        }
    }
}