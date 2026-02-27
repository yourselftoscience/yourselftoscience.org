import Footer from '@/components/Footer';

export default function TermsLayout({ children }) {
    return (
        <>
            <div className="pt-20"> {/* Add padding for global navbar */}
                {children}
            </div>
            <Footer />
        </>
    );
}
