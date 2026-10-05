import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import DeleteTestConfirmationModal from './Partials/DeleteTestConfirmationModal';

export interface AnswerOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuestionItem {
    id: string;
    text: string;
    value: number;
    options: AnswerOption[];
}

export interface Material {
    id: number;
    title: string;
}

export interface TestFormData {
    title: string;
    description: string;
    questions: QuestionItem[];
    material_ids: number[];
}

const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const clampQuestionValue = (rawInput: string): number => {
    const digitsOnly = rawInput.replace(/\D/g, '');

    if (digitsOnly === '') {
        return 1;
    }

    const lastDigit = Number(digitsOnly[digitsOnly.length - 1]);
    return Math.min(5, Math.max(1, lastDigit));
};

function MaterialPicker({
    materials,
    selectedIds,
    onChange,
}: {
    materials: Material[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = selectedIds
        .map((id) => materials.find((m) => m.id === id))
        .filter((m): m is Material => m !== undefined);

    const available = materials.filter(
        (m) =>
            !selectedIds.includes(m.id) &&
            m.title.toLowerCase().includes(query.trim().toLowerCase()),
    );

    const handlePick = (id: number) => {
        onChange([...selectedIds, id]);
        setQuery('');
        setIsOpen(false);
    };

    const handleRemove = (id: number) => {
        onChange(selectedIds.filter((selectedId) => selectedId !== id));
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {selected.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-2">
                    {selected.map((m) => (
                        <li
                            key={m.id}
                            className="clip-corner flex items-center gap-2 border-2 border-amber-600 bg-amber-500/10 py-1 pr-1 pl-2.5 text-xs font-black tracking-wider text-zinc-900 uppercase"
                        >
                            <span>{m.title}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(m.id)}
                                aria-label={`Убрать материал ${m.title}`}
                                className="flex h-5 w-5 cursor-pointer items-center justify-center text-sm leading-none font-black text-zinc-600 transition-colors hover:bg-red-600 hover:text-white"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onClick={() => setIsOpen(true)}
                placeholder="ПОИСК МАТЕРИАЛА..."
                className="w-full bg-zinc-100/90 text-zinc-950 placeholder-zinc-500 text-xs px-3 py-2.5 font-bold border-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider clip-corner"
            />

            {isOpen && (
                <div className="absolute right-0 left-0 z-30 mt-1 max-h-60 overflow-y-auto border-2 border-zinc-400 bg-zinc-100 shadow-md">
                    {available.length > 0 ? (
                        available.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => handlePick(m.id)}
                                className="cursor-pointer border-b border-zinc-300 px-3 py-2 text-xs font-bold tracking-wider text-zinc-950 uppercase transition-colors last:border-b-0 hover:bg-amber-500"
                            >
                                {m.title}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-3 text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                            {materials.length === 0
                                ? 'Материалов нет'
                                : selectedIds.length === materials.length
                                    ? 'Все материалы выбраны'
                                    : 'Ничего не найдено'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Create({ auth, materials }: PageProps<{ materials: Material[] }>) {
    const { data, setData, post, processing, errors } = useForm<TestFormData>({
        title: '',
        description: '',
        questions: [],
        material_ids: [],
    });

    const [titleState, setTitleState] = useState('');
    const [descriptionState, setDescriptionState] = useState('');

    const [questionText, setQuestionText] = useState('');
    const [questionValue, setQuestionValue] = useState<number>(1);
    const [answers, setAnswers] = useState<[string, string, string, string]>(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState<number>(0);
    const [draftError, setDraftError] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<'single' | 'all' | null>(null);
    const [targetQuestionId, setTargetQuestionId] = useState<string | null>(null);

    const handleTitleChange = (val: string) => {
        setTitleState(val);
        setData('title', val);
    };

    const handleDescriptionChange = (val: string) => {
        setDescriptionState(val);
        setData('description', val);
    };

    const handleAnswerChange = (index: number, value: string) => {
        const updated: [string, string, string, string] = [...answers];
        updated[index] = value;
        setAnswers(updated);
        if (draftError) setDraftError(null);
    };

    const handleAddQuestion = () => {
        if (!questionText.trim()) {
            setDraftError('Укажите текст вопроса');
            return;
        }

        if (answers.some((a) => !a.trim())) {
            setDraftError('Заполните все 4 варианта ответа');
            return;
        }

        const newQuestion: QuestionItem = {
            id: `q_${generateUUID()}`,
            text: questionText.trim(),
            value: questionValue,
            options: answers.map((ans, idx) => ({
                id: `opt_${generateUUID()}`,
                text: ans.trim(),
                isCorrect: idx === correctIndex,
            })),
        };

        setData('questions', [...data.questions, newQuestion]);

        setQuestionText('');
        setQuestionValue(1);
        setAnswers(['', '', '', '']);
        setCorrectIndex(0);
        setDraftError(null);
    };

    const triggerRemoveQuestionModal = (id: string) => {
        setTargetQuestionId(id);
        setDeleteTarget('single');
        setIsDeleteModalOpen(true);
    };

    const triggerResetQuestionsModal = () => {
        setTargetQuestionId(null);
        setDeleteTarget('all');
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget === 'single' && targetQuestionId) {
            setData('questions', data.questions.filter((q) => q.id !== targetQuestionId));
        } else if (deleteTarget === 'all') {
            setData('questions', []);
        }

        handleCloseModal();
    };

    const handleCloseModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        setTargetQuestionId(null);
    };

    const handleUpdateQuestionText = (qId: string, text: string) => {
        setData('questions', data.questions.map((q) => (q.id === qId ? { ...q, text } : q)));
    };

    const handleUpdateQuestionValue = (qId: string, rawInput: string) => {
        const clamped = clampQuestionValue(rawInput);
        setData('questions', data.questions.map((q) => (q.id === qId ? { ...q, value: clamped } : q)));
    };

    const handleUpdateOptionText = (qId: string, optId: string, text: string) => {
        setData('questions', data.questions.map((q) => {
            if (q.id !== qId) return q;
            return {
                ...q,
                options: q.options.map((opt) => (opt.id === optId ? { ...opt, text } : opt)),
            };
        }));
    };

    const handleSetCorrectOption = (qId: string, optId: string) => {
        setData('questions', data.questions.map((q) => {
            if (q.id !== qId) return q;
            return {
                ...q,
                options: q.options.map((opt) => ({ ...opt, isCorrect: opt.id === optId })),
            };
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tests.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div
                    className="w-full border-b-2 border-white/20 p-4 font-mono flex items-center justify-between"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, #52525b 0%, #3f3f46 80%, #27272a 100%)
                        `,
                        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
                    }}
                >
                    <div className="flex items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-widest relative z-10">
                        <span className="text-zinc-300 font-semibold hover:text-amber-400 transition cursor-pointer">
                            <Link href={route('tests.index')}>тесты</Link>
                        </span>
                        <span className="text-amber-500 font-bold">&gt;&gt;</span>
                        <span className="text-amber-400 font-bold truncate select-none">
                            создание теста
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                        <span className="h-2 w-2 rounded-xs bg-emerald-400 animate-pulse duration-3000" />
                        <span>создание_теста</span>
                    </div>
                </div>
            }
        >
            <Head title="Создание теста" />

            <form onSubmit={handleSubmit} className="w-full p-4 sm:p-6 font-mono flex flex-col justify-start items-start bg-zinc-400 gap-6">
                <div
                    className="w-full h-auto p-6 clip-corner border-[3px] border-amber-600 shadow-md"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, #d4d4d8 0%, #d4d4d8 90%, #a1a1aa 100%)
                        `,
                        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
                    }}
                >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-zinc-400">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-600 font-black">//</span>
                            <h3 className="text-base font-black text-zinc-900 uppercase tracking-widest">
                                КОНСТРУКТОР НОВОГО ТЕСТА
                            </h3>
                        </div>
                        <span className="text-[10px] font-black bg-amber-500 text-zinc-950 px-2 py-0.5 clip-corner">
                            СТАТУС: ЧЕРНОВИК
                        </span>
                    </div>

                    <div className="mb-4">
                        <label className="block text-[10px] font-black text-zinc-600 uppercase mb-1">
                            Наименование Теста
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={titleState}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="ВВЕДИТЕ НАЗВАНИЕ..."
                            required
                            className="w-full bg-zinc-100/90 text-zinc-950 placeholder-zinc-500 text-xs px-3 py-2.5 font-bold border-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider clip-corner"
                        />
                        {errors.title && <p className="text-red-700 text-[10px] font-bold mt-1 uppercase">{errors.title}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-[10px] font-black text-zinc-600 uppercase mb-1">
                            Описание и Инструкции
                        </label>
                        <textarea
                            rows={3}
                            name="description"
                            value={descriptionState}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="УКАЖИТЕ ОСНОВНЫЕ ТРЕБОВАНИЯ И ВВОДНЫЕ..."
                            className="w-full bg-zinc-100/90 text-zinc-950 placeholder-zinc-500 text-xs p-3 font-bold border-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider clip-corner resize-none"
                        />
                        {errors.description && <p className="text-red-700 text-[10px] font-bold mt-1 uppercase">{errors.description}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-zinc-600 uppercase mb-1">
                            Материалы Теста
                        </label>
                        <MaterialPicker
                            materials={materials}
                            selectedIds={data.material_ids}
                            onChange={(ids) => setData('material_ids', ids)}
                        />
                        {errors.material_ids && <p className="text-red-700 text-[10px] font-bold mt-1 uppercase">{errors.material_ids}</p>}
                    </div>

                    <div className="pt-4 border-t-2 border-zinc-400">
                        <label className="block text-[10px] font-black text-zinc-600 uppercase mb-3">
                            // ДОБАВЛЕНИЕ ВОПРОСА
                        </label>

                        <div className="bg-zinc-200/80 p-4 border-2 border-zinc-400 clip-corner">
                            <div className="mb-4 flex gap-3">
                                <div className='w-full'>
                                    <label className="block text-[10px] font-black text-zinc-600 uppercase mb-1">
                                        Текст Вопроса
                                    </label>
                                    <input
                                        type="text"
                                        value={questionText}
                                        onChange={(e) => {
                                            setQuestionText(e.target.value);
                                            if (draftError) setDraftError(null);
                                        }}
                                        placeholder="ВВЕДИТЕ ТЕКСТ ВОПРОСА..."
                                        className="w-full bg-zinc-100 text-zinc-950 placeholder-zinc-500 text-xs px-3 py-2 font-bold border-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider clip-corner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-600 uppercase mb-1">
                                        Цена Вопроса [1 - 5]
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={questionValue}
                                        onChange={(e) => {
                                            setQuestionValue(clampQuestionValue(e.target.value));
                                            if (draftError) setDraftError(null);
                                        }}
                                        placeholder="1-5"
                                        className="w-40 bg-zinc-100 text-zinc-950 placeholder-zinc-500 text-xs px-3 py-2 font-bold border-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider clip-corner"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-[10px] font-black text-zinc-600 uppercase mb-2">
                                    Варианты Ответов (Отметьте правильный)
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {answers.map((answer, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 p-2 border-2 clip-corner transition-colors ${correctIndex === index
                                                ? 'bg-emerald-950/10 border-emerald-600'
                                                : 'bg-zinc-100 border-zinc-400'
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setCorrectIndex(index)}
                                                className={`w-5 h-5 flex items-center justify-center border-2 clip-corner transition-all cursor-pointer shrink-0 ${correctIndex === index
                                                    ? 'bg-emerald-500 border-emerald-600 text-zinc-950'
                                                    : 'bg-zinc-300 border-zinc-500 text-transparent hover:border-zinc-700'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-black font-mono">✓</span>
                                            </button>

                                            <input
                                                type="text"
                                                value={answer}
                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                placeholder={`ОТВЕТ #${index + 1}...`}
                                                className="flex-1 bg-transparent text-zinc-950 placeholder-zinc-500 text-xs font-bold py-1.5 border-b-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider transition-colors"
                                            />

                                            <span
                                                className={`text-[9px] font-black uppercase px-1.5 py-0.5 clip-corner shrink-0 ${correctIndex === index
                                                    ? 'bg-emerald-500 text-zinc-950'
                                                    : 'bg-zinc-300 text-zinc-600'
                                                    }`}
                                            >
                                                {correctIndex === index ? 'ВЕРНО' : 'ОШИБКА'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {draftError && (
                                <p className="text-red-700 text-[10px] font-bold mb-3 uppercase">
                                    [ ОШИБКА ]: {draftError}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="w-full py-2 bg-zinc-950 border-2 border-amber-500 text-amber-500 text-xs font-black uppercase tracking-wider hover:bg-amber-500 hover:text-zinc-950 transition-colors clip-corner cursor-pointer"
                            >
                                + ДОБАВИТЬ ВОПРОС В ТЕСТ
                            </button>
                        </div>
                    </div>
                </div>

                {errors.questions && (
                    <p className="text-red-700 text-xs font-bold uppercase bg-zinc-300 p-3 border-2 border-red-600 clip-corner w-full">
                        [ ОШИБКА ВАЛИДАЦИИ ]: {errors.questions}
                    </p>
                )}

                {data.questions.length > 0 && (
                    <div
                        className="w-full flex flex-col gap-4 h-auto p-6 clip-corner border-[3px] border-amber-600 shadow-md bg-zinc-300"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
                            `,
                            backgroundSize: '16px 16px',
                        }}
                    >
                        <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-zinc-400">
                            <div className="flex items-center gap-2">
                                <span className="text-amber-600 font-black">//</span>
                                <h3 className="text-base font-black text-zinc-900 uppercase tracking-widest">
                                    ДОБАВЛЕННЫЕ ВОПРОСЫ В ТЕСТ ({data.questions.length})
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-600 font-black uppercase">
                                ОЧЕРЕДЬ ЗАПИСИ
                            </span>
                        </div>

                        <div className="bg-zinc-200/90 p-4 border-2 border-zinc-400 clip-corner mb-2 space-y-3">
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">
                                // ДАННЫЕ ТЕСТА (СИНХРОНИЗИРОВАНО)
                            </span>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase mb-1">
                                    Наименование Теста
                                </label>
                                <input
                                    type="text"
                                    value={titleState}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="ВВЕДИТЕ НАЗВАНИЕ..."
                                    className="w-full bg-zinc-100 text-zinc-950 placeholder-zinc-500 text-xs px-3 py-2 font-bold border-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider clip-corner"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase mb-1">
                                    Описание и Инструкции
                                </label>
                                <textarea
                                    rows={2}
                                    value={descriptionState}
                                    onChange={(e) => handleDescriptionChange(e.target.value)}
                                    placeholder="УКАЖИТЕ ОСНОВНЫЕ ТРЕБОВАНИЯ И ВВОДНЫЕ..."
                                    className="w-full bg-zinc-100 text-zinc-950 placeholder-zinc-500 text-xs p-2.5 font-bold border-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider clip-corner resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 justify-end pb-4 mb-2 border-b-2 border-zinc-400">
                            <button
                                type="button"
                                onClick={triggerResetQuestionsModal}
                                className="px-5 py-2.5 bg-zinc-300 border-2 border-red-600 text-red-700 text-xs font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors cursor-pointer clip-corner"
                            >
                                [ СБРОСИТЬ ]
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-zinc-950 border-2 border-amber-500 text-amber-500 text-xs font-black uppercase tracking-wider hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-50 transition-colors cursor-pointer clip-corner"
                            >
                                {processing ? 'СОХРАНЕНИЕ...' : '// СОХРАНИТЬ_ТЕСТ'}
                            </button>
                        </div>

                        <ul className="space-y-4">
                            {data.questions.map((q, idx) => (
                                <li
                                    key={q.id}
                                    className="bg-zinc-100 p-4 border-2 border-zinc-400 hover:border-amber-600 clip-corner transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-amber-600 font-black text-xs font-mono shrink-0">
                                                [{idx + 1}]
                                            </span>
                                            <input
                                                type="text"
                                                value={q.text}
                                                onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                                                className="w-full bg-transparent text-xs font-bold text-zinc-950 uppercase tracking-wide py-1 border-b-2 border-zinc-400 outline-hidden focus:border-amber-600 transition-colors"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <label className="text-[9px] font-black text-zinc-600 uppercase">
                                                Цена:
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={q.value}
                                                onChange={(e) => handleUpdateQuestionValue(q.id, e.target.value)}
                                                className="w-10 text-center bg-zinc-200 text-zinc-950 text-xs font-black py-1 border-2 border-zinc-400 outline-hidden focus:border-amber-600 clip-corner"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => triggerRemoveQuestionModal(q.id)}
                                            className="text-red-700 hover:bg-red-200/60 font-black text-[10px] px-2 py-0.5 border border-red-500 clip-corner cursor-pointer uppercase shrink-0 transition-colors"
                                        >
                                            [ УДАЛИТЬ ]
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-300">
                                        {q.options.map((opt, oIdx) => (
                                            <div
                                                key={opt.id}
                                                className={`flex items-center gap-2 p-2 border-2 clip-corner transition-colors ${opt.isCorrect
                                                    ? 'bg-emerald-950/10 border-emerald-600'
                                                    : 'bg-zinc-200/60 border-zinc-400'
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCorrectOption(q.id, opt.id)}
                                                    className={`w-5 h-5 flex items-center justify-center border-2 clip-corner transition-all cursor-pointer shrink-0 ${opt.isCorrect
                                                        ? 'bg-emerald-500 border-emerald-600 text-zinc-950'
                                                        : 'bg-zinc-300 border-zinc-500 text-transparent hover:border-zinc-700'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black font-mono">✓</span>
                                                </button>

                                                <span className="text-xs text-zinc-500 font-mono shrink-0">
                                                    {oIdx + 1}.
                                                </span>

                                                <input
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={(e) =>
                                                        handleUpdateOptionText(q.id, opt.id, e.target.value)
                                                    }
                                                    className="flex-1 bg-transparent text-zinc-950 text-xs font-bold py-1 border-b-2 border-zinc-400 outline-hidden focus:border-amber-600 uppercase tracking-wider transition-colors"
                                                />

                                                <span
                                                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 clip-corner shrink-0 ${opt.isCorrect
                                                        ? 'bg-emerald-500 text-zinc-950'
                                                        : 'bg-zinc-300 text-zinc-600'
                                                        }`}
                                                >
                                                    {opt.isCorrect ? 'ВЕРНО' : 'ОШИБКА'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-4 justify-end pb-4 pt-4 mb-4 border-b-2 border-t-2 border-zinc-400">
                            <button
                                type="button"
                                onClick={triggerResetQuestionsModal}
                                className="px-5 py-2.5 bg-zinc-300 border-2 border-red-600 text-red-700 text-xs font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors cursor-pointer clip-corner"
                            >
                                [ СБРОСИТЬ ]
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-zinc-950 border-2 border-amber-500 text-amber-500 text-xs font-black uppercase tracking-wider hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-50 transition-colors cursor-pointer clip-corner"
                            >
                                {processing ? 'СОХРАНЕНИЕ...' : '// СОХРАНИТЬ_ТЕСТ'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <DeleteTestConfirmationModal
                show={isDeleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                itemName={
                    deleteTarget === 'all'
                        ? 'ВСЕ ВОПРОСЫ ТЕСТА'
                        : data.questions.find((q) => q.id === targetQuestionId)?.text || 'ВЫБРАННЫЙ ВОПРОС'
                }
            />
        </AuthenticatedLayout>
    );
}