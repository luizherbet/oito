export default function FeaturesSection() {
    return (<div className="flex justify-center  flex-row flex-wrap justify-evenly">
        <div className="bg-gray-700 shadow-md rounded-lg p-6 min-w-[60%] m-4">
            <h2 className="text-xl text-gray-200 font-bold mb-2">Agenda automática</h2>
            <p className="text-gray-400">Descrição do card aqui.</p>
        </div>
        <div className="bg-blue-900 shadow-md rounded-lg p-6 w-[30%] m-4">
            <h2 className="text-xl text-gray-200 font-bold mb-2">Link de agendamento</h2>
            <p className="text-gray-400">Descrição do card aqui.</p>
        </div>
        <div className="bg-gray-800 shadow-md rounded-lg p-6 w-[30%] m-4">
            <h2 className="text-xl text-gray-200 font-bold mb-2">Portfólio integrado</h2>
            <p className="text-gray-400">Descrição do card aqui.</p>
        </div>
        <div className="bg-indigo-900 shadow-md rounded-lg p-6 w-[60%] m-4">
            <h2 className="text-xl text-gray-200 font-bold mb-2">Histórico do cliente</h2>
            <p className="text-gray-400">Descrição do card aqui.</p>
        </div>
    </div>)
}