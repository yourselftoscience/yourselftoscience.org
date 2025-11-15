import fs from 'fs';
import path from 'path';
import CodeLicenseClientPage from './CodeLicenseClientPage';

export const metadata = {
    title: 'Code License | Yourself To Science',
    description: 'Source code license for Yourself To Science. The underlying source code is licensed under the GNU Affero General Public License (AGPL-3.0).',
    robots: {
        index: false,
        follow: true,
    },
};

const CodeLicensePage = () => {
    const filePath = path.join(process.cwd(), 'LICENSE-CODE');
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceUrl = "https://github.com/yourselftoscience/yourselftoscience.org/blob/main/LICENSE-CODE";

    return <CodeLicenseClientPage content={content} sourceUrl={sourceUrl} />;
};

export default CodeLicensePage; 