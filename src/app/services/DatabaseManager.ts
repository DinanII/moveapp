import { CapacitorSQLite, capSQLiteChanges, capSQLiteValues } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { BehaviorSubject, Observable, switchMap, of, from } from "rxjs";
import { delegateToFactory } from "@angular/compiler";

export class DatabaseManager {

    private constructor() { }

    /**
     * What the key is named where the database name is stored under in the SecureStorage Plugin.
     * @private
     */
    private static readonly DB_NAME_KEY = 'db_name';

    /**
     * The name of the app's internal database
     * @private
     */
    private static readonly DB_NAME = 'movedb';

    /**
     * dbReady Internal subject to set the DB as initialized
     * @private
     */
    private static dbReadySubject = new BehaviorSubject<boolean>(false);

    public static get isReady(): boolean { return DatabaseManager.dbReadySubject.value }

    /**
     * dbReady: Public observable others (like components, services) where this service is injected in can read.
     * This observable is readonly to prevent accidental (outside) edits.
     */
    public static readonly dbReady$ = DatabaseManager.dbReadySubject.asObservable();

    // #region Start

    /**
     * Returns {@link DB_NAME} when {@link dbReady$} is true, throws an {@link Error} otherwise.
     * @returns string
     * @private
     */
    private static get database(): string {
        return DatabaseManager.DB_NAME;
    }

    public static readonly pageSize: number = 5;

    private static initPromise: Promise<void> | null = null;


    /**
     * Performs checks if database can be set up (Capacitor.isNativePlatform() must be true) and creates an {@link HTMLIonAlertElement} and logs if an errors occur.
     * Attempts to call {@link setupDatabase()}.
     */
    static init(): Promise<void> {
        if (DatabaseManager.dbReadySubject.value) {
            return Promise.resolve();
        }
        if (!Capacitor.isNativePlatform()) {
            return Promise.reject(
                new Error("SQLite is only available on native platforms.")
            );
        }
        if (!DatabaseManager.initPromise) {
            DatabaseManager.initPromise = DatabaseManager.setupDatabase()
                .then(() => {
                    if (!DatabaseManager.dbReadySubject.value) {
                        throw new Error("Database initialization completed, but the database is not ready.");
                    }
                })
                .catch((error) => {
                    // Allow a later call to retry initialization.
                    DatabaseManager.initPromise = null;
                    console.error(`Failed to init database: ${error}`)
                    throw error;
                });
        }

        return DatabaseManager.initPromise;
    }
    // #endregion


    // #region Setup

    /**
     * If {@link DB_NAME_KEY} exists in {@link SecureStoragePlugin}, the database will be opened via {@link openDatabase}.
     * When no value with the key exists, the database is created via {@link downloadAndCreateDatabase}.
     * @private
     */
    private static async setupDatabase(): Promise<void> {
        console.log("Checking database...");

        let isSetup = false;

        try {
            const result = await SecureStoragePlugin.get({ key: DatabaseManager.DB_NAME_KEY });

            isSetup = result.value != null && result.value !== "";
        } catch (error) {
            console.log(`Failed to retrieve storage key: ${error}`);
        }

        if (isSetup) {
            await DatabaseManager.openDatabase();
        } else {
            await DatabaseManager.downloadAndCreateDatabase();
        }

        if (!DatabaseManager.dbReadySubject.value) {
            throw new Error("Database setup finished without setting dbReadySubject to true.");
        }
    }

    /**
     * Creates a connection to and opens the internal database. Only if {@link dbReady$} is false, an error will be logged otherwise.
     * @private
     */
    private static async openDatabase(): Promise<void> {
        console.trace('Creating database connection for existing database');
        // TODO: Replace this with the observable
        if (!DatabaseManager.dbReadySubject.value) {
            console.log("Opening database...");
            await CapacitorSQLite.createConnection({
                database: DatabaseManager.database,
            });
            await CapacitorSQLite.open({
                database: DatabaseManager.database,
            });
            await CapacitorSQLite.execute({
                statements: "PRAGMA foreign_keys = 1;",
                database: DatabaseManager.database
            })
            console.log(`Database connected successfully (so it seems). ${DatabaseManager.database}`);
            DatabaseManager.dbReadySubject.next(true);
            return
        }
        console.warn(`Database was already connected successfully.`);
    }

    /**
     * Closes the connection to the internal database.
     */
    static async closeDatabase(): Promise<void> {
        // TODO: Replace this with the observable
        if (DatabaseManager.dbReadySubject.value) {
            console.log(`Closing database ...`)

            await CapacitorSQLite.closeConnection({
                database: DatabaseManager.database
            })
            // TODO: Replace this with the observable
            DatabaseManager.dbReadySubject.next(false);
            return
        }
        console.warn(`Database was already closed.`);
    }

    // #endregion

    // #region Initial Setup

    /**
     * Downloads the database model from the assets' directory, initializes a database connection, imports the model and creates a sync table.
     * The internal {@link DB_NAME} is also stored in the SecureStorage.
     * @private
     */
    private static async downloadAndCreateDatabase(): Promise<void> {
        console.trace("Creating database connection during initial setup");
        console.log("INITIALIZING DATABASE ...");

        const response = await fetch("/migrations/initial_db.sql");

        if (!response.ok) {
            throw new Error(
                `Failed to fetch SQL data: ${response.status} - ${response.statusText}`
            );
        }

        const sqlString = await response.text();

        if (!sqlString.trim()) {
            throw new Error("The initial database SQL file is empty.");
        }

        await CapacitorSQLite.createConnection({
            database: DatabaseManager.database,
        });

        await CapacitorSQLite.open({
            database: DatabaseManager.database,
        });

        await CapacitorSQLite.execute({
            statements: "PRAGMA foreign_keys = 1;",
            database: DatabaseManager.database,
        });

        await CapacitorSQLite.execute({
            statements: sqlString,
            database: DatabaseManager.database,
        });

        await SecureStoragePlugin.set({
            key: DatabaseManager.DB_NAME_KEY,
            value: DatabaseManager.DB_NAME,
        });

        DatabaseManager.dbReadySubject.next(true);

        console.log("Initial database created and initialized successfully.");
    }
    // Create sync table (with database parameter)
    // await CapacitorSQLite.createSyncTable({
    //     database: DatabaseManager.database
    // });

    // #endregion

    // #region Queries


    // TODO: values should be one of the following: string, number, null,

    /**
     * 
     * @param mode There are roughly speaking 2 ways to perform queries; query (looking a value up in a table, with optional joins to other tables) and modify/run that modifies
     * a record in some way. Pass either the string "search" (SELECT queries) or "modify" (INSERT & UPDATE) depending on your needs.
     * @param statement The actual SQL query itself, with or without values (altough without is generally discouraged due to SQL injection).
     * Important:  `LIMIT 50` is always placed after the submitted statement to limit the amount of retrieved records to 50. Pagination is available to the offset param.,
     * @param values The values for the query
     * 
     * @param offset From which index to start returning records. This param is optional and for select queries only, default is 0.
     * 
     * @returns Promise with {@link capSQLiteValues} when a query with {@link mode} "search" is executed, a promise with {@link capSQLiteChanges}
     * when a query with {@link mode} "modify" is executed or null if the query fills (no valid mode passed or database is not (yet) ready).
     * 
     * @example
     * 
     * performQuery("search", "SELECT * FROM activities WHERE `ac_started_at` >= ?;",[1791552070])
     * 
     * @example
     * 
     * performQuery("modify", "INSERT INTO `activities` (ac_id, ac_started_at, ac_ended_at) VALUES (1,1791552070,1791553990);")
     * 
     * @example
     * 
     * Example SQL queries (pass the values in the {@link values} argument)
     * 
     * DELETE FROM products WHERE id = ?;
     * INSERT INTO products (name, currency, value, vendorid) VALUES (?, 'EUR', ?, ?);
     * SELECT * FROM products LEFT JOIN vendors ON vendors.id = products.vendorid WHERE products.id = ?;
     * SELECT * FROM products;
     */
    public static async performQuery(mode: "modify", statement: string, values?: any[]): Promise<capSQLiteChanges | null>;
    public static async performQuery(mode: "search", statement: string, values?: any[], offset?: number): Promise<capSQLiteValues | null>;
    public static async performQuery(mode: "search" | "modify", statement: string, values: any[] = [], offset: number = 0): Promise<capSQLiteValues | capSQLiteChanges | null> {
        // TODO: Replace this with the observable
        if (DatabaseManager.dbReadySubject.value) {
            switch (mode) {
                case "search":
                    if(isNaN(offset) || offset < 0 || offset >= Infinity ) return null
                    const query = `${statement} LIMIT ${DatabaseManager.pageSize} OFFSET ${offset}`
                    console.log(`Query: ${query}`);
                    const queryResult: capSQLiteValues = await CapacitorSQLite.query({
                        database: DatabaseManager.database,
                        statement: query,
                        values: values,
                    })
                    return queryResult
                case "modify":
                    const changeResult: capSQLiteChanges = await CapacitorSQLite.run({
                        database: DatabaseManager.database,
                        statement,
                        values,
                    });
                    return changeResult
                default:
                    console.warn(`No query performed, unknown mode (${mode}) passed`)
                    return null
            }
        }
        console.warn(`Query not performed, since DB is not ready (yet)`)
        return null;
    }

    //#endregion

    // #region Export/Debug

    /**
     * Meant for development purposes, generates a JSON export from the database and returns it.
     * @param mode
     */
    static async getDatabaseExport(mode: 'full' | 'partial' = 'full') {
        return CapacitorSQLite.exportToJson({
            database: DatabaseManager.database,
            jsonexportmode: mode,
        });
    }

    /**
     * Closes the database if is not ready and deletes it. The {@link DB_NAME} in SecureStorage is also cleared.
     */
    private static async deleteDatabase(): Promise<void> {
        if (!DatabaseManager.dbReady$) return;

        await CapacitorSQLite.deleteDatabase({
            database: DatabaseManager.database,
        });

        await DatabaseManager.closeDatabase();


        await SecureStoragePlugin.remove({ key: DatabaseManager.DB_NAME_KEY })
    }

    /**
     * Closes the database if is not ready and deletes it. The {@link DB_NAME} in SecureStorage is also cleared.
     */
    static async resetDatabase(): Promise<void> {
        if (!DatabaseManager.dbReady$) return;
        console.log(`===================== RESETTING DATABASE ...`)
        await DatabaseManager.deleteDatabase();

        await DatabaseManager.init()
    }

    // #endregion
}