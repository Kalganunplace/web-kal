const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://hrsqcroirtzbdoeheyxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc3Fjcm9pcnR6YmRvZWhleXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjEyNjUsImV4cCI6MjA2NjkzNzI2NX0.hoVI2aI4rJncvo_9w5ZTNTqtsdjWEdCnxzsvBAb7-cw';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 이미지 파일과 knife_types ID 매핑
const imageMapping = [
  {
    file: 'sikdo.png',
    knifeId: '33f35df2-cde0-4366-ada7-69eec0c74119',
    name: '일반 식도류'
  },
  {
    file: 'jeongukdo.png',
    knifeId: '997bca53-533f-44b0-9b03-17d8480fa82e',
    name: '정육도'
  },
  {
    file: 'gwado.png',
    knifeId: 'ee62449f-cde0-4dd6-a303-75bcb54dc790',
    name: '과도'
  },
  {
    file: 'hoegal.png',
    knifeId: '3765e1c6-c950-4d60-a62d-2fe966a14ae4',
    name: '회칼'
  },
  {
    file: 'scissors.png',
    knifeId: 'eb2687c2-1909-4cb5-88b1-1c74a89bafba',
    name: '일반 가위'
  }
];

async function uploadImages() {
  const imagesDir = path.join(__dirname, '../public/images/knife');

  for (const mapping of imageMapping) {
    const filePath = path.join(imagesDir, mapping.file);

    try {
      // 파일 읽기
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = `knife/${mapping.file}`;

      console.log(`Uploading ${mapping.name} (${mapping.file})...`);

      // Supabase Storage에 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, fileBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error(`Upload error for ${mapping.name}:`, uploadError);
        continue;
      }

      // Public URL 생성
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log(`Uploaded: ${publicUrl}`);

      // knife_types 테이블 업데이트
      const { error: updateError } = await supabase
        .from('knife_types')
        .update({ image_url: publicUrl })
        .eq('id', mapping.knifeId);

      if (updateError) {
        console.error(`Update error for ${mapping.name}:`, updateError);
      } else {
        console.log(`✓ Updated ${mapping.name} with image URL\n`);
      }

    } catch (error) {
      console.error(`Error processing ${mapping.name}:`, error);
    }
  }

  console.log('All images uploaded and database updated!');
}

uploadImages();
