import { useState } from 'react';

export function useThermalPrinter() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Print via Web Bluetooth (ideal for wireless thermal printers)
  const printViaBluetooth = async (buffer: Uint8Array) => {
    setIsPrinting(true);
    setError(null);
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Web Bluetooth API tidak didukung di browser ini.');
      }

      // Request device (filter by printers, or accept all)
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2'] // Common printer service UUIDs
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error('Gagal koneksi GATT ke printer.');

      // Find standard printer service
      const services = await server.getPrimaryServices();
      if (services.length === 0) throw new Error('Tidak ada layanan yang ditemukan di perangkat ini.');
      
      const service = services[0]; // Usually the primary service is for printing
      const characteristics = await service.getCharacteristics();
      
      // Find write characteristic
      const writeCharacteristic = characteristics.find(
        (c) => c.properties.write || c.properties.writeWithoutResponse
      );

      if (!writeCharacteristic) throw new Error('Tidak dapat menemukan jalur tulis (write characteristic) pada printer.');

      // Bluetooth MTU (Maximum Transmission Unit) is typically small (e.g., 20 or 512 bytes).
      // We chunk the buffer to avoid overflow errors.
      const CHUNK_SIZE = 512;
      for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
        const chunk = buffer.slice(i, i + CHUNK_SIZE);
        await writeCharacteristic.writeValue(chunk);
        // Small delay to let printer buffer process
        await new Promise(resolve => setTimeout(resolve, 50)); 
      }

      // Disconnect when done
      device.gatt?.disconnect();
    } catch (err: any) {
      console.error('Bluetooth Print Error:', err);
      setError(err.message || 'Gagal mencetak via Bluetooth.');
    } finally {
      setIsPrinting(false);
    }
  };

  // Print via Web Serial (ideal for USB thermal printers)
  const printViaUSB = async (buffer: Uint8Array) => {
    setIsPrinting(true);
    setError(null);
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API tidak didukung di browser ini.');
      }

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 }); // Common baud rate for thermal printers

      const writer = port.writable.getWriter();
      await writer.write(buffer);
      writer.releaseLock();
      
      await port.close();
    } catch (err: any) {
      console.error('USB Print Error:', err);
      setError(err.message || 'Gagal mencetak via USB/Serial.');
    } finally {
      setIsPrinting(false);
    }
  };

  return {
    isPrinting,
    error,
    printViaBluetooth,
    printViaUSB
  };
}
