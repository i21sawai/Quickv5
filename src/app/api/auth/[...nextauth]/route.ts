import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'パスワード',
      credentials: {
        username: { label: '名前', type: 'text' },
        password: { label: 'パスワード', type: 'password' },
      },
      // ... 前略

async authorize(credentials, req) {
  console.log('--- NextAuth Authorize Function Debug Log ---');
  console.log('SA_CLIENT_EMAIL:', process.env.SA_CLIENT_EMAIL);
  console.log('USER_SPREADSHEET_ID:', process.env.USER_SPREADSHEET_ID);

  console.log('SA_PRIVATE_KEY_EXISTS:', !!process.env.SA_PRIVATE_KEY);
  if (process.env.SA_PRIVATE_KEY) {
      console.log('SA_PRIVATE_KEY_START:', process.env.SA_PRIVATE_KEY.substring(0, 30) + '...');
  }
  console.log('NEXTAUTH_SECRET_IS_SET:', !!process.env.NEXTAUTH_SECRET);

  const serviceAccountAuth = new JWT({
    email: process.env.SA_CLIENT_EMAIL,
    key: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  try { // GoogleSpreadsheetへのアクセス部分をtry-catchで囲むと、より詳細なエラーが分かります
    const doc = new GoogleSpreadsheet(
      process.env.USER_SPREADSHEET_ID!,
      serviceAccountAuth
    );
    await doc.loadInfo();
    console.log('Spreadsheet loaded successfully. Title:', doc.title); // 追加
    const sheet = doc.sheetsByIndex[0];
    console.log('Accessing sheet:', sheet.title); // 追加
    const rows = await sheet.getRows();
    console.log('Number of rows found in spreadsheet:', rows.length); // 追加

    // ここで userDB は GoogleSpreadsheetRow オブジェクト（または undefined）
    const userDB = rows.find(
      (row) => row.get('ユーザーID') === credentials?.username
    );

    console.log('User found in spreadsheet (userDB exists):', !!userDB); // userDB が見つかったか否か
    if (userDB) {
        console.log('UserDB properties - ユーザーID:', userDB.get('ユーザーID')); // 見つかったユーザーのIDをログ
        console.log('UserDB properties - パスワード:', userDB.get('パスワード')); // 見つかったユーザーのパスワードをログ
        console.log('Input Username:', credentials?.username); // 入力されたユーザー名をログ
        console.log('Input Password:', credentials?.password); // 入力されたパスワードをログ
        console.log('Password Match Check:', userDB.get('パスワード') === credentials?.password); // パスワードの一致チェック結果
    }


    let user:
      | {
          email: string;
          name: string;
          id: string;
          role: string;
        }
      | undefined;

    if (!userDB) {
      console.log('User not found in spreadsheet for username:', credentials?.username);
    } else {
      if (userDB.get('パスワード') === credentials?.password) {
        user = {
          email: JSON.stringify({ role: userDB.get('権限') }),
          name: credentials?.username!,
          id: credentials?.username!,
          role: userDB.get('権限'),
        };
        console.log('Authentication successful. User role:', user.role); // 成功時のログ
      } else {
        console.log('Authentication failed: Password mismatch for user:', credentials?.username); // パスワード不一致時のログ
      }
    }

    if (user) {
      console.log('Returning user object from authorize function.'); // ユーザーオブジェクトを返す直前
      return user;
    } else {
      console.log('Returning null from authorize function (authentication failed).'); // nullを返す直前
      return null;
    }

  } catch (error) {
    console.error('Error during spreadsheet access or authentication:', error); // エラーをキャッチしてログに出力
    return null; // エラーが発生した場合は認証失敗として null を返す
  } finally {
    console.log('--- End NextAuth Authorize Function Debug Log ---'); // 最終的な終了ログ
  }
}

// ...,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
  },
});

export { handler as GET, handler as POST };
