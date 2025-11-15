import fs from 'fs';
import path from 'path';
import ContentLicenseClientPage from './ContentLicenseClientPage';

export const metadata = {
    title: 'Content License | Yourself To Science',
    description: 'Content license for Yourself To Science. The content is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0).',
    robots: {
        index: false,
        follow: true,
    },
};

const ContentLicensePage = () => {
    const filePath = path.join(process.cwd(), 'LICENSE-CONTENT');
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceUrl = "https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-CONTENT";

    return <ContentLicenseClientPage content={content} sourceUrl={sourceUrl} />;
};

export default ContentLicensePage; 