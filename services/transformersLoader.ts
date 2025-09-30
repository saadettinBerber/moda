// Transformers.js'i npm paketinden import ediyoruz
export const loadTransformers = async () => {
  try {
    console.log('🔧 Transformers.js yükleniyor...');
    
    // Dinamik import ile @xenova/transformers paketini yüklüyoruz
    const transformers = await import('@xenova/transformers');
    
    // ONNX runtime ayarlarını yapılandır
    if (transformers.env) {
      // WebAssembly backend'ini yapılandır
      transformers.env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
      transformers.env.backends.onnx.wasm.numThreads = 1;
      transformers.env.allowRemoteModels = true;
      transformers.env.allowLocalModels = false;
      transformers.env.useBrowserCache = true;
      
      console.log('🔧 ONNX runtime yapılandırıldı');
    }
    
    console.log('✅ Transformers.js başarıyla yüklendi');
    return transformers;
  } catch (error) {
    console.error('❌ Transformers.js yüklenirken hata:', error);
    throw new Error(`Transformers.js yüklenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};
