const Spinner = () => {
    return (
        <div className="relative w-12 h-12 rotate-spinner" >
            {
                [...Array(8)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-secondary"
                        style={{
                            top: `${24 + 20 * Math.sin((i * Math.PI) / 4)}px`,
                            left: `${24 + 20 * Math.cos((i * Math.PI) / 4)}px`,
                        }}
                    />
                ))}
            <style>{`
          .rotate-spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
        </div>
    )
};

const SimpleSpinner = ({ className = 'w-6 h-6' }: { className?: string }) => {
    return (
        <div className={`${className} border-4 border-gray-200 border-t-4 border-t-primary rounded-full animate-spin`}></div>
    )
}

export default Spinner;
export { SimpleSpinner };