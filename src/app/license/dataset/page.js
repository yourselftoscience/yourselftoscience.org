import fs from 'fs';
import path from 'path';
import DatasetLicenseClientPage from './DatasetLicenseClientPage';

export const metadata = {
  title: 'Dataset License | Yourself to Science',
  description:
    'Dataset license for Yourself to Science. The dataset is dedicated to the public domain under the Creative Commons CC0 1.0 Universal Public Domain Dedication (CC0 1.0).',
  robots: {
    index: false,
    follow: true,
  },
};

const DatasetLicensePage = () => {
  const filePath = path.join(process.cwd(), 'LICENSE-DATASET');
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceUrl =
    'https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-DATASET';

  return <DatasetLicenseClientPage content={content} sourceUrl={sourceUrl} />;
};

export default DatasetLicensePage;
