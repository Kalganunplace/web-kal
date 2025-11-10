-- 칼 타입 이미지 URL 업데이트
-- 피그마 디자인에 맞춘 새로운 이미지 경로

UPDATE knife_types SET image_url = '/images/knife/sikdo.png' WHERE name = '일반식도류';
UPDATE knife_types SET image_url = '/images/knife/jeongukdo.png' WHERE name = '정육도';
UPDATE knife_types SET image_url = '/images/knife/gwado.png' WHERE name = '과도류';
UPDATE knife_types SET image_url = '/images/knife/hoegal.png' WHERE name = '회칼';
UPDATE knife_types SET image_url = '/images/knife/scissors.png' WHERE name = '일반가위';
