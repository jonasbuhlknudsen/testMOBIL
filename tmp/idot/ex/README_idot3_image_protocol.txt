iDot-3 Image Protocol (Template)

- Pixel formats: RGB888, RGB565LE, GRB888
- SOF, CHUNK, EOF structure with CRC16-CCITT
- BLE MTU=247, chunk payload ~232-236 bytes
- Use with_response for SOF/EOF, without_response for CHUNKs

Files:
- idot3_image_protocol_template.json : JSON template describing frame + packets
- idot3_image_protocol_template.csv  : CSV listing packet types and fields
