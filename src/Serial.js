const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}

class Serial {
    constructor() {
        this.buffer = [];
        this.send_active = false;
    }

    static requestPort() {
        const filters = [
            { 'vendorId': 0x239A }, // Adafruit boards
            { 'vendorId': 0xcafe }, // TinyUSB example
        ];
        return navigator.usb.requestDevice({ 'filters': filters });
    }

    getEndpoints(interfaces) {
        interfaces.forEach(element =>
            element.alternates.forEach(elementalt => {
                if (elementalt.interfaceClass === 0xFF) {
                    console.log("Interface number:");
                    console.log(element.interfaceNumber);
                    this.ifNum = element.interfaceNumber;
                    elementalt.endpoints.forEach(elementendpoint => {
                        if (elementendpoint.direction === "out") {
                            console.log("Endpoint out: ");
                            console.log(elementendpoint.endpointNumber);
                            this.epOut = elementendpoint.endpointNumber;
                        }

                        if (elementendpoint.direction === "in") {
                            console.log("Endpoint in: ");
                            console.log(elementendpoint.endpointNumber);
                            this.epIn = elementendpoint.endpointNumber;
                        }
                    });
                }
            }));
    }

    async getDevice() {
        this.ready = false;
        const device = await Serial.requestPort();
        console.log("Opening device...");
        this.device = device;
        await device.open();

        console.log("Selecting configuration");
        await device.selectConfiguration(1);
        console.log("Getting endpoints")
        this.getEndpoints(device.configuration.interfaces);
        console.log("Claiming interface");
        await device.claimInterface(this.ifNum);
        console.log("Select alt interface");
        await device.selectAlternateInterface(this.ifNum, 0);
        console.log("Control Transfer Out");
        await device.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x01,
            'index': this.ifNum
        })
        console.log("Ready!");
        this.ready = true;
    }

    async read(num) {
        try {
            return await this.device.transferIn(this.epIn, num);
        } catch (error) {
            console.log("Error");
            console.log(error);
            throw error;
        }
    }

    async readHex(num) {
        const result = await this.read(num);
        console.log("RES");
        console.log(result.data.buffer);
        return buf2hex(result.data.buffer);
    }

    async readString() {
        try {
            const result = await this.device.transferIn(this.epIn, 64);
            console.log("ReadResult");
            console.log(result);
            const textDecoder = new TextDecoder();
            console.log(textDecoder.decode(result.data));
        } catch (error) {
            console.log("ReadError");
            console.log(error);
        }
    }

    sendString(str) {
        return this.send(new TextEncoder().encode(str));
    }

    sendHex(str) {
        return this.send(fromHexString(str));
    }

    send(data) {
        return this.device.transferOut(this.epOut, data);
    }

    bufSendFunction() {
        this.send_active = true;
        if (this.buffer.length === 0) {
            this.send_active = false;
            return;
        }
        const element = this.buffer.shift();
        const data = element[0];
        const delay = element[1];
        this.send(data).then(() => {
            setTimeout(() => {
                this.bufSendFunction();
            }, delay);
        });
    }

    bufSend(data, delay) {
        this.buffer.push([data, delay]);
        // Sender is not active, create new one
        if (!this.send_active) {
            this.bufSendFunction();
        }
    }

    bufSendHex(str, delay) {
        const data = fromHexString(str);
        this.bufSend(data, delay);
    }
}

export default Serial;
