

export const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
        <div className="flex h-screen">
            <main className="flex-1 cols-span-4 overflow-y-auto p-8">
                {children}
            </main>

        </div>
    )
}