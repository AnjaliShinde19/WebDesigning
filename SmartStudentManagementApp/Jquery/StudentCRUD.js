// 1. Open/Create the Database 
async function openDatabase() {
    const dbName = 'StudentDatabase';
    const version = 1;

    const db = await idb.openDB(dbName, version,
        {
            upgrade(db) {
                // Create an object store named 'tblStudents' with 'id' as the primary key, auto-incrementing
                const store = db.createObjectStore('tblStudents', { keyPath: 'id', autoIncrement: true });

                // Create an index on the 'TotalMarks' property for efficient searching and sorting
                store.createIndex('TotalMarksIndex', 'TotalMarks', { unique: false })
            },
        });
    return db;
}

// 2. Create (Add) Data. Use the add() or put() method within a readwrite transaction to create new records.
// Example usage:- createUser({ name: 'Alice', email: 'alice@example.com' });
async function createStudent(studData) {
    try {
        const db = await openDatabase();

        // Start a read/write transaction on the 'tblStudents' store
        const tx = db.transaction('tblStudents', 'readwrite');
        const store = tx.objectStore('tblStudents');

        await store.add(studData); // Add the new Student object
        await tx.done; // Wait for the transaction to complete

        opStatus = "inserted";
        $('#studentOpModal').modal('show');
        console.log('Student added successfully');
    }
    catch (error) {
        alert('Failed to insert record.')
        console.log('Error: ' + error);
    }

}

//3. Read Data. To read data, use a readonly transaction and methods like get() for single items (by key) or getAll() for all items. 
async function readStudent(studId) {
    const db = await openDatabase();
    // Start a read-only transaction (default)
    const studentDetails = await db.get('tblStudents', studId); // Get Student by their primary key ('id')

    //console.log('Retrieved Student:', studentDetails);
    return studentDetails;
}

async function readAllStudents() {
    const db = await openDatabase();
    const allStudents = await db.getAll('tblStudents'); // Get all students
    //console.log('All Students:', allStudents);
    return allStudents;
}

async function getStudentsAscending() {
    const db = await openDatabase();
    // 'next' is the default direction, so this works for ascending order
    const studList = await db.getAllFromIndex('tblStudents', 'TotalMarksIndex');
    //console.log('Ascending order:', studList);
    return studList;
}

async function getStudentsDescending() {
    const db = await openDatabase();
    // To get descending order, you would typically use openCursor with the 'prev' direction
    // Since getAllFromIndex does not directly support direction as an argument in the standard 'idb' API,
    // you use the cursor approach for specific ordering needs as shown in search results:
    const transaction = db.transaction('tblStudents', 'readonly');
    const store = transaction.objectStore('tblStudents');
    const index = store.index('TotalMarksIndex');
    const students = [];
    let cursor = await index.openCursor(null, 'prev'); // 'prev' for descending

    while (cursor) {
        students.push(cursor.value);
        cursor = await cursor.continue();
    }
    await transaction.complete;
    //console.log('Descending order:', students);
    return students;
}

async function filterByTotalMarks(minAge, maxAge) {
    debugger;
    const db = await openDatabase();
    const transaction = db.transaction("tblStudents", 'readonly');
    const store = transaction.objectStore('tblStudents');
    const index = store.index('TotalMarksIndex');

    // Define a key range for exact matching
    const range = IDBKeyRange.bound(minAge, maxAge)
   
    // Get all matching records using the index
    const matchingUsers = await index.getAll(range);

    await transaction.done;
    return matchingUsers;
}

// 4. Update Data. Similar to creating data, updating uses a readwrite transaction and the put() method.
// put() will insert a new record if the key doesn't exist or update the existing one if it does. 
// Example usage:- updateUser({ id: 1, name: 'Alice Smith', email: 'alice.smith@example.com' });
async function updateStudent(updatedStudentData) {
    debugger;
    const db = await openDatabase();
    const tx = db.transaction('tblStudents', 'readwrite');
    const store = tx.objectStore('tblStudents');

    await store.put(updatedStudentData); // Update the Students object (must contain the 'id')
    await tx.done;

    opStatus = "updated";
    $('#studentOpModal').modal('show');
    //console.log('Student updated successfully');
}

// 5. Delete Data. Use the delete () method within a readwrite transaction to remove a record by its key.
// Example usage:-  deleteUser(1);
async function deleteStudent(studId) {
    const db = await openDatabase();
    const tx = db.transaction('tblStudents', 'readwrite');
    const store = tx.objectStore('tblStudents');

    await store.delete(studId); // Delete user by their primary key ('id')
    await tx.done;

    console.log(`Student with ID ${studId} deleted`);
    return studId;
}
