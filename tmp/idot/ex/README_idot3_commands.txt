iDot-3 Commands (AI-Ready)

Files:
- idot3_command_schema.json   : JSON Schema describing a single command entry.
- idot3_commands_template.jsonl : JSON Lines with common commands (placeholders for unknowns).
- idot3_commands_template_ai_ready.csv : Flattened CSV for spreadsheet/LLM ingestion.

Conventions:
- Hex strings are UPPER or lower, space-separated, e.g. "AA 55 02 FF 00 00 96".
- Unknown / not yet measured values are null.
- write_mode: "with_response" or "without_response".
- checksum.method is "none" until measured (set to "xor", "sum_mod_256", "crc8", etc., once discovered).
- payload_fields define binary layout: each field has offset (bytes from payload start) and length (bits).

Workflow to finalize:
1) Capture BLE traffic while pressing buttons in the original app (nRF Connect or OS sniffer).
2) For each action, add cmd_id, header/footer (if any), payload bytes, checksum method and example_request_hex.
3) If the device replies on notify, add example_response_hex and map response_fields offsets.
4) Set confidence to "measured" once verified.

UUID Defaults (assumed common for FEE7 devices):
- service_uuid     = 0000fee7-0000-1000-8000-00805f9b34fb
- write_char_uuid  = 000036f5-0000-1000-8000-00805f9b34fb
- notify_char_uuid = 000036f6-0000-1000-8000-00805f9b34fb
If your device differs, replace these three values globally.

This template is designed so an AI can ingest either the JSONL directly, or the CSV, to generate code for Android/iOS and validate frames.
