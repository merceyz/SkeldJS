import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { ShipStatus } from "../component/ShipStatus";
import { SystemStatus } from "./SystemStatus";

export enum DeconState {
    Enter = 0x1,
    Closed = 0x2,
    Exit = 0x4,
    HeadingUp = 0x8
}

export interface DeconSystemData extends SystemStatus {
    timer: number;
    state: number;
}

export class DeconSystem extends SystemStatus {
    static systemType = SystemType.Decontamination as const;
    systemType = SystemType.Decontamination as const;
    
    timer: number;
    state: number;

    constructor(ship: ShipStatus, data?: HazelBuffer|DeconSystemData) {
        super(ship, data);
    }

    Deserialize(reader: HazelBuffer, spawn: boolean) {
        if (!spawn) {
            this.timer = reader.byte();
            this.state = reader.byte();
        }
    }

    Serialize(writer: HazelBuffer, spawn: boolean) {
        if (!spawn) {
            writer.byte(this.timer);
            writer.byte(this.state);
        }
    }
}